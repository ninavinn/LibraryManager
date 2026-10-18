"use strict";
/** A single book. Implements the IBook interface. */
class Book {
    constructor(id, title, author, year, status = "available", genre) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.year = year;
        this.status = status;
        this.genre = genre;
    }
    isAvailable() {
        return this.status === "available";
    }
    /** if/else decides the human-readable status text. */
    getStatusLabel() {
        if (this.isAvailable()) {
            return "Available";
        }
        else {
            return "Not available";
        }
    }
    /** Flips the status: available -> unavailable and back. */
    toggleStatus() {
        if (this.isAvailable()) {
            this.status = "unavailable";
        }
        else {
            this.status = "available";
        }
    }
    /** Case-insensitive title match, used by the search box. */
    matchesTitle(query) {
        return this.title.toLowerCase().includes(query.trim().toLowerCase());
    }
    update(title, author, year) {
        this.title = title;
        this.author = author;
        this.year = year;
    }
}
/** Base class for library staff. */
class Employee {
    constructor(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
    getRole() {
        return "Librarian";
    }
    /** Prints the employee's name to the console. */
    printName() {
        console.log(`Employee name: ${this.name}`);
    }
    describe() {
        return `${this.name} helps readers find and borrow books.`;
    }
}
/** Developer inherits everything from Employee and adds its own data. */
class Developer extends Employee {
    constructor(name, language) {
        super(name); // runs the Employee constructor first
        this.language = language;
    }
    /** Describes what the developer does and logs it. */
    describeAction() {
        const text = `${this.name} writes code in ${this.language}.`;
        console.log(text);
        return text;
    }
    // Polymorphism: same method names, different behaviour.
    getRole() {
        return "Developer";
    }
    printName() {
        super.printName();
        console.log(`Role: ${this.getRole()}, language: ${this.language}`);
    }
    describe() {
        return `${this.name} builds and maintains the library website in ${this.language}.`;
    }
}
//# sourceMappingURL=models.js.map