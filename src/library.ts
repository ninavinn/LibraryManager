class Library {
  private books: Book[] = []; // main data store (private = encapsulated)
  private nextId = 1;

  constructor(initialBooks: NewBookInput[] = []) {
    initialBooks.forEach((input) => this.addBook(input));
  }

  addBook(input: NewBookInput): Book {
    const genre = input.genre?.trim();
    const book = new Book(
      this.nextId++,
      input.title.trim(),
      input.author.trim(),
      input.year,
      input.status ?? "available",
      genre ? genre : undefined,
    );
    this.books.push(book);
    return book;
  }

  /** Removes a book by id. Returns true if something was deleted. */
  removeBook(id: number): boolean {
    const before = this.books.length;
    this.books = this.books.filter((book) => book.id !== id);
    return this.books.length < before;
  }

  findById(id: number): Book | undefined {
    return this.books.find((book) => book.id === id);
  }

  toggleStatus(id: number): Book | undefined {
    const book = this.findById(id);
    if (book) {
      book.toggleStatus();
    }
    return book;
  }

  updateBook(
    id: number,
    title: string,
    author: string,
    year: number,
  ): Book | undefined {
    const book = this.findById(id);
    if (book) {
      book.update(title.trim(), author.trim(), year);
    }
    return book;
  }

  /** Filters by title and (optionally) by status. */
  search(query: string, status: StatusFilter = "all"): Book[] {
    return this.books.filter((book) => {
      const matchesQuery = query.trim() === "" || book.matchesTitle(query);
      const matchesStatus = status === "all" || book.status === status;
      return matchesQuery && matchesStatus;
    });
  }

  getAll(): readonly Book[] {
    return this.books;
  }

  getStats(): LibraryStats {
    const available = this.books.filter((book) => book.isAvailable()).length;
    return {
      total: this.books.length,
      available,
      unavailable: this.books.length - available,
    };
  }

  /** Validates raw form values. Pass ignoreId when editing an existing book. */
  validate(raw: RawBookInput, ignoreId?: number): ValidationResult {
    const errors: FieldErrors = {};
    const title = raw.title.trim();
    const author = raw.author.trim();
    const currentYear = new Date().getFullYear();
    const year = Number(raw.year);

    if (title.length < 2) {
      errors.title = "Enter a title (at least 2 characters).";
    } else if (title.length > 100) {
      errors.title = "The title can be at most 100 characters.";
    }

    if (author.length < 2) {
      errors.author = "Enter an author name (at least 2 characters).";
    }

    if (
      raw.year.trim() === "" ||
      !Number.isInteger(year) ||
      year < 1000 ||
      year > currentYear
    ) {
      errors.year = `Enter a year between 1000 and ${currentYear}.`;
    }

    // Same title + author is a duplicate (ignoring the book being edited).
    const duplicate = this.books.some(
      (book) =>
        book.id !== ignoreId &&
        book.title.toLowerCase() === title.toLowerCase() &&
        book.author.toLowerCase() === author.toLowerCase(),
    );
    if (!errors.title && !errors.author && duplicate) {
      errors.title = "This book is already in the library.";
    }

    return { valid: Object.keys(errors).length === 0, errors, year };
  }
}
