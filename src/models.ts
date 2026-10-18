/** A single book. Implements the IBook interface. */
class Book implements IBook {
  readonly id: number;
  title: string;
  author: string;
  year: number;
  status: BookStatus;
  genre?: string;

  constructor(
    id: number,
    title: string,
    author: string,
    year: number,
    status: BookStatus = "available",
    genre?: string,
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.year = year;
    this.status = status;
    this.genre = genre;
  }

  isAvailable(): boolean {
    return this.status === "available";
  }

  /** if/else decides the human-readable status text. */
  getStatusLabel(): string {
    if (this.isAvailable()) {
      return "Available";
    } else {
      return "Not available";
    }
  }

  /** Flips the status: available -> unavailable and back. */
  toggleStatus(): void {
    if (this.isAvailable()) {
      this.status = "unavailable";
    } else {
      this.status = "available";
    }
  }

  /** Case-insensitive title match, used by the search box. */
  matchesTitle(query: string): boolean {
    return this.title.toLowerCase().includes(query.trim().toLowerCase());
  }

  update(title: string, author: string, year: number): void {
    this.title = title;
    this.author = author;
    this.year = year;
  }
}

/** Base class for library staff. */
class Employee {
  // protected: visible inside Employee and its subclasses only (encapsulation)
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  getRole(): string {
    return "Librarian";
  }

  /** Prints the employee's name to the console. */
  printName(): void {
    console.log(`Employee name: ${this.name}`);
  }

  describe(): string {
    return `${this.name} helps readers find and borrow books.`;
  }
}

/** Developer inherits everything from Employee and adds its own data. */
class Developer extends Employee {
  private language: string; // private: only Developer can touch it

  constructor(name: string, language: string) {
    super(name); // runs the Employee constructor first
    this.language = language;
  }

  /** Describes what the developer does and logs it. */
  describeAction(): string {
    const text = `${this.name} writes code in ${this.language}.`;
    console.log(text);
    return text;
  }

  // Polymorphism: same method names, different behaviour.
  override getRole(): string {
    return "Developer";
  }

  override printName(): void {
    super.printName();
    console.log(`Role: ${this.getRole()}, language: ${this.language}`);
  }

  override describe(): string {
    return `${this.name} builds and maintains the library website in ${this.language}.`;
  }
}
