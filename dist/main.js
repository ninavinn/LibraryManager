"use strict";
/** Finds an element by id or fails loudly (no silent null checks later). */
function requireElement(id) {
    const node = document.getElementById(id);
    if (!node) {
        throw new Error(`Element #${id} was not found in index.html`);
    }
    return node;
}
class App {
    constructor() {
        this.form = requireElement("bookForm");
        this.searchInput = requireElement("searchInput");
        this.statusSelect = requireElement("statusFilter");
        this.listEl = requireElement("bookList");
        this.editingId = null;
        this.query = "";
        this.statusFilter = "all";
        // The initial data store: at least 5 books.
        this.library = new Library([
            {
                title: "Clean Code",
                author: "Robert C. Martin",
                year: 2008,
                genre: "Programming",
            },
            {
                title: "The Pragmatic Programmer",
                author: "Andrew Hunt",
                year: 1999,
                genre: "Programming",
            },
            {
                title: "Eloquent JavaScript",
                author: "Marijn Haverbeke",
                year: 2018,
                genre: "Programming",
            },
            {
                title: "Design Patterns",
                author: "Erich Gamma",
                year: 1994,
                genre: "Programming",
                status: "unavailable",
            },
            {
                title: "ვეფხისტყაოსანი",
                author: "შოთა რუსთაველი",
                year: 1200,
                genre: "Classic",
            },
            {
                title: "ჯაყოს ხიზნები",
                author: "მიხეილ ჯავახიშვილი",
                year: 1925,
                genre: "Classic",
                status: "unavailable",
            },
        ]);
        this.view = new LibraryView(this.listEl, requireElement("teamList"), requireElement("toastHost"));
    }
    init() {
        this.bindEvents();
        this.showTeam();
        this.refresh();
        console.log(`Library ready with ${this.library.getAll().length} books.`);
    }
    // ---------- staff (inheritance + polymorphism demo) ----------
    showTeam() {
        const staff = [
            new Employee("Nino Beridze"),
            new Developer("Luka Gelashvili", "TypeScript"),
        ];
        staff.forEach((member) => member.printName()); // each class prints its own way
        staff.forEach((member) => {
            if (member instanceof Developer) {
                member.describeAction();
            }
        });
        this.view.renderTeam(staff);
    }
    // ---------- events ----------
    bindEvents() {
        this.form.addEventListener("submit", (event) => this.handleAdd(event));
        // Typing in a field clears that field's error message.
        this.form.addEventListener("input", (event) => {
            const field = event.target;
            if (field.name === "title" ||
                field.name === "author" ||
                field.name === "year") {
                requireElement(`${field.name}Error`).textContent = "";
                field.setAttribute("aria-invalid", "false");
            }
        });
        this.searchInput.addEventListener("input", () => {
            this.query = this.searchInput.value;
            this.refresh();
        });
        this.statusSelect.addEventListener("change", () => {
            this.statusFilter = this.statusSelect.value;
            this.refresh();
        });
        // Event delegation: one listener serves every button of every card.
        this.listEl.addEventListener("click", (event) => this.handleListClick(event));
        this.listEl.addEventListener("keydown", (event) => this.handleListKeydown(event));
    }
    handleAdd(event) {
        event.preventDefault();
        const data = new FormData(this.form);
        const raw = {
            title: String(data.get("title") ?? ""),
            author: String(data.get("author") ?? ""),
            year: String(data.get("year") ?? ""),
        };
        const result = this.library.validate(raw);
        this.showFormErrors(result.errors);
        if (!result.valid) {
            return;
        }
        const genre = String(data.get("genre") ?? "");
        const book = this.library.addBook({
            title: raw.title,
            author: raw.author,
            year: result.year,
            genre,
        });
        this.form.reset();
        this.showFormErrors({});
        this.query = "";
        this.statusFilter = "all";
        this.searchInput.value = "";
        this.statusSelect.value = "all";
        this.refresh();
        this.view.showToast(`Added "${book.title}".`, "success");
        console.log("Book added:", book);
    }
    showFormErrors(errors) {
        const names = ["title", "author", "year"];
        for (const name of names) {
            const message = errors[name] ?? "";
            requireElement(`${name}Error`).textContent = message;
            requireElement(`book${name[0].toUpperCase()}${name.slice(1)}`).setAttribute("aria-invalid", message ? "true" : "false");
        }
    }
    handleListClick(event) {
        const target = event.target;
        const button = target.closest("[data-action]");
        const card = target.closest("[data-id]");
        if (!button || !card) {
            return;
        }
        const id = Number(card.dataset.id);
        const action = button.dataset.action;
        switch (action) {
            case "toggle":
                this.toggleBook(id);
                break;
            case "edit":
                this.editingId = id;
                this.refresh();
                break;
            case "delete":
                this.deleteBook(id);
                break;
            case "save":
                this.saveEdit(id, card);
                break;
            case "cancel":
                this.editingId = null;
                this.refresh();
                break;
        }
    }
    handleListKeydown(event) {
        const target = event.target;
        const card = target.closest("[data-id]");
        if (!card || !target.matches("input")) {
            return;
        }
        if (event.key === "Enter") {
            this.saveEdit(Number(card.dataset.id), card);
        }
        else if (event.key === "Escape") {
            this.editingId = null;
            this.refresh();
        }
    }
    // ---------- actions ----------
    toggleBook(id) {
        const book = this.library.toggleStatus(id);
        if (book) {
            this.refresh();
            this.view.showToast(`"${book.title}" is now ${book.getStatusLabel().toLowerCase()}.`);
        }
    }
    deleteBook(id) {
        const book = this.library.findById(id);
        if (!book) {
            return;
        }
        if (!window.confirm(`Delete "${book.title}" from the library?`)) {
            return;
        }
        this.library.removeBook(id);
        if (this.editingId === id) {
            this.editingId = null;
        }
        this.refresh();
        this.view.showToast(`Deleted "${book.title}".`);
    }
    saveEdit(id, card) {
        const read = (field) => card.querySelector(`[data-field="${field}"]`)?.value ??
            "";
        const raw = {
            title: read("title"),
            author: read("author"),
            year: read("year"),
        };
        const result = this.library.validate(raw, id);
        if (!result.valid) {
            this.view.showEditError(card, result.errors);
            return;
        }
        this.library.updateBook(id, raw.title, raw.author, result.year);
        this.editingId = null;
        this.refresh();
        this.view.showToast("Book updated.", "success");
    }
    /** Re-draws the list and the statistics from the current data. */
    refresh() {
        const visible = this.library.search(this.query, this.statusFilter);
        this.view.render(visible, this.editingId, this.library.getAll().length === 0);
        this.view.renderStats(this.library.getStats());
    }
}
window.addEventListener("DOMContentLoaded", () => {
    new App().init();
});
//# sourceMappingURL=main.js.map