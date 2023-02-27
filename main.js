const API = "http://localhost:8000/products";

//?  переменные для инпутов: добавление товара

let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let image = document.querySelector("#image");
let btnAdd = document.querySelector("#btn-add");

// input для edit

let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImage = document.querySelector("#edit-image");
let editSaveBtn = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");

// блок куда добавляются карточки
let list = document.querySelector("#product-list");

// pagination
let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
let currentPage = 1;
let pageTotalCount = 1;

// search
let searchInput = document.querySelector("#search");
let searchVal = "";

btnAdd.addEventListener("click", async function () {
  // формируем обьект на основе данных из инпута
  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };
  // проверка на заполненность
  if (
    !obj.title.trim() ||
    !obj.price.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim()
  ) {
    alert("заполните поле");
    return;
  }
  await fetch(API, {
    method: "POSt",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });
  // !  очищаем инпуты
  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = "";

  render();
});

// функция отображения карточек продукта

async function render() {
  // получаем  список продуктов
  let res = await fetch(`${API}?q=${searchVal}&_page=${currentPage}&_limit=3`);

  let products = await res.json();

  drawPaginationButtons();

  //! очищаем лист
  list.innerHTML = "";

  // !перебираем массив products
  products.forEach((element) => {
    // создаем новый див
    let newElem = document.createElement("div");
    // задаем новый id диву
    newElem.id = element.id;

    // помещаем карточку из бутсрапа в новый див
    newElem.innerHTML = `
    <div class="card m-5" style="width: 18rem;">
  <img src="${element.image}" class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">${element.title}</h5>
    <p class="card-text">${element.descr}</p>
    <p class="card-text">$${element.price}</p>

    <a href="#" id=${element.id} class="btn btn-dark btn-delete">Delete</a>
    <a href="#" id=${element.id} class="btn btn-light btn-edit" data-bs-toggle="modal" data-bs-target="#exampleModal">Edit</a>

  </div>
</div>
    
    `;
    //! добавляем созданный див с карточкой внутри в лист
    list.append(newElem);
  });
}
render();

//! удаление продукта

// вещаем слушатель событий на весь document
document.addEventListener("click", (e) => {
  // делаем проверку , для того , чтобы отловить клик именно по элементу с классом  btn-delete
  if (e.target.classList.contains("btn-delete")) {
    // вытаскиеваем по id
    console.log("delete clicked");
    // делаем запрос для удаления
    let id = e.target.id;

    fetch(`${API}/${id}`, { method: "DELETE" }).then(() => render());
    // вызываем функцию (render) отображения актуальных данных
  }
});

// ! edit

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    let id = e.target.id;

    // получаем данные редактируемого продукта
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // заполняем инпуты модального окна , данными которые мы стянули  сервера
        editTitle.value = data.title;
        editPrice.value = data.price;
        editDescr.value = data.descr;
        editImage.value = data.image;

        // даем id для кнопки сохранения изменения
        editSaveBtn.setAttribute("id", data.id);
      });
  }
});

// ! функция для отправки отредактированных данных на сервер

// отлавливаем клик по кнопке едит
editSaveBtn.addEventListener("click", function (e) {
  let id = e.target.id;
  // вытаскиваем айди
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;
  let image = editImage.value;

  // проверка на заполненность
  if (!title.trim() || !descr.trim() || !price.trim() || !image.trim()) {
    alert("заполните поле");
    return;
  }
  // фоормируем и собираем обьект на основе данных из инпута
  let editedProduct = {
    title: title,
    price: price,
    descr: descr,
    image: image,
  };
  // функция сохранения на сервере
  saveEdit(editedProduct, id);
});

// функция сохранения на сервере
function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(editedProduct),
  }).then(() => render());

  // закрываем модальное окно
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

// pagination
// функция для отрисовки кнопок пагинации
function drawPaginationButtons() {
  // отправляем запрос для получения обшего количества продуктов
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      // рассчитываем общее количество страниц
      pageTotalCount = Math.ceil(data.length / 3);

      paginationList.innerHTML = ""; //очищаем для предотвращения дублирования

      for (let i = 1; i <= pageTotalCount; i++) {
        // создаем кнопки с цифрами и для текущей страницы задаем класс active
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML += `
        <li class="page-item active"><a class="page-link page_number" href="#">${i}</a></li> 

          `;
          paginationList.append(page1);
        } else {
          let page1 = document.createElement("li");
          page1.innerHTML += `
          <li class="page-item"><a class="page-link page_number" href="#">${i}</a></li> 
  
            `;
          paginationList.append(page1);
        }
      }
      // красим в серый цвер пред и след кнопки
      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}
// слушатель событий для кнопки prev

// drawPaginationButtons();

prev.addEventListener("click", () => {
  // делаем проверку на то не находимся ли мы на первой странице
  if (currentPage <= 1) {
    return;
  } //если не находимся на первой то перезаписываем currPage и вызываем render
  currentPage--;
  render();
});

next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

document.addEventListener("click", function (e) {
  // отлавливаем click по цифре из pagination
  if (e.target.classList.contains("page_number")) {
    // опять перезаписываем currentPage на то значение которое содержит элемент на который нажали
    currentPage = e.target.innerText;
    // вызываем render с перезаписанным currentPage
    render();
  }
});

// search
searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  render();
});
