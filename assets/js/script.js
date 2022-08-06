let bookshelf = [];

document.addEventListener("DOMContentLoaded", () => {
  const submitBook = document.getElementById("inputBook");
  const searchBook = document.getElementById("searchBook");

  submitBook.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  searchBook.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBookShelf();
  });

  if (localStorageExist()) {
    loadBookFromStorage();
  }
});

document.addEventListener("ondataloaded", () => {
  refreshBookData();
});

// Storage

const localStorageExist = () => {
  if (typeof Storage === "undefined") {
    alert("Sorry, your browser does not support local storage");
    return false;
  }
  return true;
};

const saveBookData = () => {
  const stringifyBook = JSON.stringify(bookshelf);
  localStorage.setItem("bookshelf_data", stringifyBook);
  document.dispatchEvent(new Event("ondatasaved"));
};

const loadBookFromStorage = () => {
  const serializedBook = localStorage.getItem("bookshelf_data");

  let book = JSON.parse(serializedBook);

  if (book !== null) {
    bookshelf = book;
  }

  document.dispatchEvent(new Event("ondataloaded"));
};

const updateBookToStorage = () => {
  if (localStorageExist()) {
    saveBookData();
  }
};

const NewDataBook = (title, author, year, isComplete) => {
  return {
    id: +new Date(),
    title,
    author,
    year,
    isComplete,
  };
};

const findBook = (bookId) => {
  for (book of bookshelf) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
};

const findBookIndex = (bookId) => {
  let index = 0;
  for (book of bookshelf) {
    if (book.id === bookId) return index;

    index++;
  }
  return -1;
};

const refreshBookData = () => {
  const incompletedBooks = document.getElementById("incompleteBookshelfList");
  const completedBooks = document.getElementById("completeBookshelfList");

  for (bookslist of bookshelf) {
    const bookArrive = putBook(
      bookslist.title,
      bookslist.author,
      bookslist.year,
      bookslist.isComplete
    );
    bookArrive["bookId"] = bookslist.id;

    if (bookslist.isComplete) {
      completedBooks.append(bookArrive);
    } else {
      incompletedBooks.append(bookArrive);
    }
  }
};

const addBook = () => {
  const id = new Date().getTime();

  const bookTitle = document.getElementById("inputBookTitle").value;
  const authorName = document.getElementById("inputBookAuthor").value;
  const yearBook = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("bookChecked").checked;

  const dataBook = putBook(bookTitle, authorName, yearBook, isComplete);
  let bookshelfName;

  const objectBook = NewDataBook(bookTitle, authorName, yearBook, isComplete);

  dataBook["bookId"] = objectBook.id;
  bookshelf.push(objectBook);

  if (isComplete) {
    bookshelfName = "completeBookshelfList";
  } else {
    bookshelfName = "incompleteBookshelfList";
  }

  document.getElementById(bookshelfName).appendChild(dataBook);
  updateBookToStorage();
};

const putBook = (title, author, year, isComplete) => {
  const bookTitle = document.createElement("h2");
  bookTitle.classList.add("title");
  bookTitle.innerText = title;

  const bookAuthor = document.createElement("h4");
  bookAuthor.innerText = author;

  const bookYear = document.createElement("p");
  bookYear.innerText = year;

  const authorLabel = document.createElement("label");
  authorLabel.innerText = "Author: ";

  const yearLabel = document.createElement("label");
  yearLabel.innerText = "Year: ";

  const authorContainer = document.createElement("div");
  authorContainer.classList.add("author-container");
  authorContainer.append(authorLabel, bookAuthor);

  const yearContainer = document.createElement("div");
  yearContainer.classList.add("year-container");
  yearContainer.append(yearLabel, bookYear);

  const inLineContainer = document.createElement("div");
  inLineContainer.classList.add("inline-container");

  const textContainer = document.createElement("div");
  textContainer.setAttribute("class", "book-item");
  textContainer.append(
    inLineContainer,
    bookTitle,
    authorContainer,
    yearContainer
  );

  const button = document.createElement("div");
  button.classList.add("buttons");

  if (isComplete) {
    button.append(makeUndoButton(), makeRemoveButton());
  } else {
    button.append(makeFinishButton(), makeRemoveButton());
  }

  textContainer.appendChild(button);
  return textContainer;
};

const makeUndoButton = () => {
  return createButton(
    "undo-button" && "material-icons",
    (event) => {
      undoBookFromComplete(event.target.parentElement.parentElement);
    },
    "bookmark"
  );
};

const makeRemoveButton = () => {
  return createButton(
    "red-button" && "material-icons",
    (event) => {
      removeBookFromComplete(event.target.parentElement.parentElement);
      swal("Book Deleted", {
        icon: "success",
      });
      updateBookToStorage();
    },
    "delete"
  );
};

const makeFinishButton = () => {
  return createButton(
    "green-button" && "material-icons",
    (event) => {
      addBookToComplete(event.target.parentElement.parentElement);
      updateBookToStorage();
    },
    "bookmark_border"
  );
};

const createButton = (buttonTypeClass, eventListener, type) => {
  const button = document.createElement("button");
  button.classList.add(buttonTypeClass);
  button.innerText = type;
  button.addEventListener("click", (event) => {
    eventListener(event);
    updateBookToStorage();
  });

  return button;
};

const removeBookFromComplete = (bookElement) => {
  const bookPosition = findBookIndex(bookElement["bookId"]);
  bookshelf.splice(bookPosition, 1);
  bookElement.remove();
};

const addBookToComplete = (bookElement) => {
  const bookCompleted = document.getElementById("completeBookshelfList");

  const title = bookElement.querySelector(".book-item > h2").innerText;
  const author = bookElement.querySelector(
    ".book-item > .author-container > h4"
  ).innerText;
  const year = bookElement.querySelector(
    ".book-item > .year-container > p"
  ).innerText;

  const newBook = putBook(title, author, year, true);
  bookCompleted.append(newBook);

  const getBook = findBook(bookElement["bookId"]);
  getBook.isComplete = true;
  newBook["bookId"] = getBook.id;

  bookElement.remove();
  updateBookToStorage();
};

const undoBookFromComplete = (bookElement) => {
  const bookIncompleted = document.getElementById("incompleteBookshelfList");
  const title = bookElement.querySelector(".book-item > h2").innerText;
  const author = bookElement.querySelector(
    ".book-item > .author-container > h4"
  ).innerText;
  const year = bookElement.querySelector(
    ".book-item > .year-container > p"
  ).innerText;

  const newBook = putBook(title, author, year, false);
  bookIncompleted.append(newBook);

  const getBook = findBook(bookElement["bookId"]);
  getBook.isComplete = false;
  newBook["bookId"] = getBook.id;

  bookElement.remove();

  updateBookToStorage();
};

// searchBook
const searchBookShelf = () => {
  let search = document.getElementById("searchBookTitle").value;

  let bookCard = document.getElementsByClassName("book-item");

  for (bookItem of bookCard) {
    let bookTitle = bookItem.innerText.toUpperCase();
    let searchBook = bookTitle.search(search.toUpperCase());

    if (searchBook != -1) {
      bookItem.style.display = "";
    } else {
      bookItem.style.display = "none";
    }
  }
};
