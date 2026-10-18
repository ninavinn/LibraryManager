class LibraryView {
  constructor(
    private readonly listEl: HTMLUListElement,
    private readonly teamEl: HTMLUListElement,
    private readonly toastHost: HTMLElement,
  ) {}

  // ---------- small DOM helpers ----------

  /** Generic element builder: the tag name decides the return type. */
  private el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className = "",
    text = "",
  ): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  private button(
    label: string,
    action: CardAction,
    className: string,
  ): HTMLButtonElement {
    const btn = this.el("button", `btn ${className}`, label);
    btn.type = "button";
    btn.dataset.action = action;
    return btn;
  }

  private setText(id: string, value: string | number): void {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = String(value);
    }
  }

  // ---------- rendering ----------

  /** Clears the old HTML and builds a card for every book. */
  render(
    books: readonly Book[],
    editingId: number | null,
    libraryIsEmpty: boolean,
  ): void {
    this.listEl.replaceChildren();

    if (books.length === 0) {
      this.listEl.append(this.createEmptyState(libraryIsEmpty));
      return;
    }

    for (const book of books) {
      this.listEl.append(this.createCard(book, book.id === editingId));
    }

    if (editingId !== null) {
      const field = this.listEl.querySelector<HTMLInputElement>(
        '[data-field="title"]',
      );
      field?.focus();
      field?.select();
    }
  }

  renderStats(stats: LibraryStats): void {
    this.setText("statTotal", stats.total);
    this.setText("statAvailable", stats.available);
    this.setText("statUnavailable", stats.unavailable);
  }

  renderTeam(staff: Employee[]): void {
    this.teamEl.replaceChildren();
    for (const member of staff) {
      const item = this.el("li", "member");
      const head = this.el("div", "member-head");
      head.append(
        this.el("strong", "", member.getName()),
        this.el("span", "role", member.getRole()),
      );
      item.append(head, this.el("p", "member-text", member.describe()));
      this.teamEl.append(item);
    }
  }

  private createEmptyState(libraryIsEmpty: boolean): HTMLLIElement {
    const item = this.el("li", "empty");
    item.append(
      this.el(
        "strong",
        "",
        libraryIsEmpty ? "The library is empty" : "No books match your search",
      ),
      libraryIsEmpty
        ? "Add the first book using the form."
        : "Try another title or change the status filter.",
    );
    return item;
  }

  private createCard(book: Book, editing: boolean): HTMLLIElement {
    const card = this.el("li", `book book-${book.status}`);
    card.dataset.id = String(book.id);

    if (editing) {
      card.append(this.createEditForm(book));
      return card;
    }

    const info = this.el("div", "book-info");
    info.append(
      this.el("h3", "book-title", book.title),
      this.el("p", "book-author", `by ${book.author}`),
    );

    const meta = this.el("p", "book-meta", String(book.year));
    if (book.genre) {
      meta.append(` · ${book.genre}`);
    }
    info.append(meta);

    const pill = this.el(
      "span",
      `pill pill-${book.status}`,
      book.getStatusLabel(),
    );

    const actions = this.el("div", "book-actions");
    actions.append(
      this.button(
        book.isAvailable() ? "Mark unavailable" : "Mark available",
        "toggle",
        "btn-ghost",
      ),
      this.button("Edit", "edit", "btn-ghost"),
      this.button("Delete", "delete", "btn-danger"),
    );

    card.append(pill, info, actions);
    return card;
  }

  private createEditForm(book: Book): HTMLElement {
    const wrap = this.el("div", "edit-form");

    const fields: Array<{
      name: FieldName;
      label: string;
      type: string;
      value: string;
    }> = [
      { name: "title", label: "Title", type: "text", value: book.title },
      { name: "author", label: "Author", type: "text", value: book.author },
      { name: "year", label: "Year", type: "number", value: String(book.year) },
    ];

    for (const field of fields) {
      const label = this.el("label", "edit-field");
      label.append(this.el("span", "", field.label));
      const input = this.el("input");
      input.type = field.type;
      input.value = field.value;
      input.dataset.field = field.name;
      label.append(input);
      wrap.append(label);
    }

    const error = this.el("p", "edit-error");
    error.dataset.role = "error";
    error.setAttribute("role", "alert");

    const actions = this.el("div", "book-actions");
    actions.append(
      this.button("Save", "save", "btn-primary"),
      this.button("Cancel", "cancel", "btn-ghost"),
    );

    wrap.append(error, actions);
    return wrap;
  }

  /** Shows validation messages under the edit fields of a card. */
  showEditError(card: HTMLElement, errors: FieldErrors): void {
    const message = Object.values(errors).join(" ");
    const node = card.querySelector<HTMLElement>('[data-role="error"]');
    if (node) {
      node.textContent = message;
    }
  }

  /** Temporary message that removes itself after 3 seconds. */
  showToast(
    message: string,
    type: "info" | "success" | "error" = "info",
  ): void {
    const toast = this.el("div", `toast toast-${type}`, message);
    toast.setAttribute("role", "status");
    this.toastHost.append(toast);

    while (this.toastHost.children.length > 3) {
      this.toastHost.firstElementChild?.remove();
    }

    setTimeout(() => toast.remove(), 3000);
  }
}
