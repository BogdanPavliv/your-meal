"use strict";

/* ================= Libs start ========================= */

(function () {
  var canUseWebP = function () {
    var elem = document.createElement("canvas");

    if (!!(elem.getContext && elem.getContext("2d"))) {
      // was able or not to get WebP representation
      return elem.toDataURL("image/webp").indexOf("data:image/webp") == 0;
    }

    // very old browser like IE 8, canvas not supported
    return false;
  };

  var isWebpSupported = canUseWebP();

  if (isWebpSupported === false) {
    var lazyItems = document.querySelectorAll("[data-src-replace-webp]");

    for (var i = 0; i < lazyItems.length; i += 1) {
      var item = lazyItems[i];

      var dataSrcReplaceWebp = item.getAttribute("data-src-replace-webp");
      if (dataSrcReplaceWebp !== null) {
        item.setAttribute("data-src", dataSrcReplaceWebp);
      }
    }
  }

  var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy",
  });
})();

/* ================= Libs end ========================= */

/* ================= myLib start ========================= */

(function () {
  window.myLib = {};

  window.myLib.body = document.querySelector("body");

  window.myLib.closestAttr = function (item, attr) {
    var node = item;

    while (node) {
      var attrValue = node.getAttribute(attr);
      if (attrValue) {
        return attrValue;
      }

      node = node.parentElement;
    }

    return null;
  };

  window.myLib.closestItemByClass = function (item, className) {
    var node = item;

    while (node) {
      if (node.classList.contains(className)) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  };

  window.myLib.toggleScroll = function () {
    myLib.body.classList.toggle("no-scroll");
  };
})();

/* ================= myLib end ========================= */

/* ================= popup start ========================= */

(function () {
  var showPopup = function (target) {
    target.classList.add("is-active");
  };

  var closePopup = function (target) {
    target.classList.remove("is-active");
  };

  myLib.body.addEventListener("click", function (e) {
    var target = e.target;
    var popupClass = myLib.closestAttr(target, "data-popup");

    if (popupClass === null) {
      return;
    }

    e.preventDefault();
    var popup = document.querySelector("." + popupClass);

    if (popup) {
      showPopup(popup);
      myLib.toggleScroll();
    }
  });

  myLib.body.addEventListener("click", function (e) {
    var target = e.target;

    if (
      target.classList.contains("popup-close") ||
      target.classList.contains("popup__inner")
    ) {
      var popup = myLib.closestItemByClass(target, "popup");

      closePopup(popup);
      myLib.toggleScroll();
    }
  });

  myLib.body.addEventListener("keydown", function (e) {
    if (e.keyCode !== 27) {
      return;
    }

    var popup = document.querySelector(".popup.is-active");

    if (popup) {
      closePopup(popup);
      myLib.toggleScroll();
    }
  });
})();

/* ================= popup end ========================= */

/* ================= catalog start ========================= */

document.querySelectorAll(".catalog-nav__btn").forEach((item) =>
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const id = e.currentTarget.getAttribute("href").replace("#", "");

    document.querySelectorAll(".catalog-nav__btn").forEach((child) => child.classList.remove("catalog-nav__btn--active"));
    document.querySelectorAll(".catalog__content-item").forEach((child) =>
      child.classList.remove("catalog__content-item--active")
    );

    document.querySelector(".catalog__title").textContent = item.textContent;

    item.classList.add("catalog-nav__btn--active");
    document.getElementById(id).classList.add("catalog__content-item--active");
  })
);

document.querySelector(".catalog-nav__btn").click();

/* ================= catalog end ========================= */

/* ================= product start ========================= */

(function () {
  var catalog = document.querySelector(".catalog");

  if (catalog === null) {
    return;
  }

  var updateProductPrice = function (product, price) {
    var productPrice = product.querySelector(".product__price--value");
    productPrice.textContent = price;
  };

  var changeProductOrderInfo = function (target) {
    var product = myLib.closestItemByClass(target, "product");
    var order = document.querySelector(".popup-products");

    var productTitle = product.querySelector(".product__title").textContent;
    var productWeight = product.querySelector(".product__weight").textContent;
    var productPrice = product.querySelector(".product__price--value").textContent;
    var productImgSrc = product.querySelector(".product__img").getAttribute("src");

    var productDescription = product.querySelector(".product__description--text").textContent;

    var productWeight = product.querySelector(".product__weight--value").textContent;

    var productNutrition = product.querySelector(".product__nutrition--value").textContent;

    order.querySelector(".popup__title").textContent = productTitle;
    order.querySelector(".popup-product__price-value").textContent = productPrice;

    order.querySelector(".popup-product__img").setAttribute("src", productImgSrc);
    order.querySelector(".popup-product__description--text").textContent = productDescription;
    order.querySelector(".popup-product__weight").textContent = productWeight;
    order.querySelector(".popup-product__nutrition").textContent = productNutrition;

    var productDescriptionListItem = product.querySelectorAll(".product__description--list-item");
    var orderproductDescriptionListItem = order.querySelectorAll(".product__description--list-item");

    for (let i = 0; i < productDescriptionListItem.length; i++) {
      const productItem = productDescriptionListItem[i];

      for (let j = 0; j < orderproductDescriptionListItem.length; j++) {
        const orderItem = orderproductDescriptionListItem[i];
        orderItem.textContent = productItem.textContent;
      }
    }
  };

  catalog.addEventListener("click", function (e) {
    var target = e.target;

    if (target.classList.contains("product__btn")) {
      e.preventDefault();
      changeProductOrderInfo(target);
    }
  });
})();

/* ================= product end ========================= */

/* ================= cart start ========================= */

(function () {
  const cartDOMElement = document.querySelector(".js-cart");

  if (!cartDOMElement) {
    return;
  }
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const cartItemsCounterDOMElement = document.querySelector(".js-cart-total-count-items");
  const cartTotalPriceDOMElement = document.querySelector(".js-cart-total-price");
  const cartTotalPriceInputDOMElement = document.querySelector(".js-cart-total-price-input");
  const cartWrapperDOMElement = document.querySelector(".section__card");

  const renderCartItem = ({ id, name, price, weight, src, quantity }) => {
    const cartItemDOMElement = document.createElement("div");

    const cartItemTemplate = `
        <div class="cart-item cart__item">
          <div class="cart-item__main">
            <button class="cart-item__btn cart-item__btn--remove js-btn-cart-item-remove" type="button">
              Видалити
            </button>
            <div class="cart-item__product">											
                <img class="cart-item__img lazy" src="${src}" alt="" >												
                <div class="cart-item__content">
                    <h3 class="cart-item__title">${name}</h3>
                    <input type="hidden" name="${id}-Товар" value="${name}">
                    <input class="js-cart-input-quantity" type="hidden" name="${id}-Кількість" value="${quantity}">
                    <p class="cart-item__weight">${weight}</p>
                    <input type="hidden" name="${id}-Вага" value="${weight}">   
                    <p class="cart-item__price"><span class="js-cart-item-price">${
                      price * quantity
                    }</span> грн.</p>
                    <input class="js-cart-input-price" type="hidden" name="${id}-Ціна" value="${price * quantity}">
                    <input class="js-cart-total-price-input" type="hidden" name="Загальна сума">
                </div>
          </div>										
          <div class="cart-item__end">
            <div class="cart-item__actions">
                    <button class="cart-item__btn js-btn-product-decrease-quantity" type="button">-</button>
                    <span class="cart-item__quantity js-cart-item-quantity">${quantity}</span>
                    <button class="cart-item__btn js-btn-product-increase-quantity" type="button">+</button>
            </div>
          </div>
          </div>
        </div>
      `;

    cartItemDOMElement.innerHTML = cartItemTemplate;
    cartItemDOMElement.setAttribute("data-product-id", id);
    cartItemDOMElement.classList.add("js-cart-item");
    cartDOMElement.appendChild(cartItemDOMElement);
  };

  const saveCart = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const updateCartTotalPrice = () => {
    const totalPrice = Object.keys(cart).reduce((acc, id) => {
      const { quantity, price } = cart[id];
      return acc + price * quantity;
    }, 0);

    if (cartTotalPriceDOMElement) {
      cartTotalPriceDOMElement.textContent = totalPrice;
    }

    if (cartTotalPriceInputDOMElement) {
      cartTotalPriceInputDOMElement.value = totalPrice;
    }
  };

  const updateCartTotalItemsCounter = () => {
    const totalQuantity = Object.keys(cart).reduce((acc, id) => {
      const { quantity } = cart[id];
      return acc + quantity;
    }, 0);

    if (cartItemsCounterDOMElement) {
      cartItemsCounterDOMElement.textContent = totalQuantity;
    }

    return totalQuantity;
  };

  const updateCart = () => {
    const totalQuantity = updateCartTotalItemsCounter();
    updateCartTotalPrice();
    saveCart();

    if (totalQuantity === 0) {
      cartWrapperDOMElement.classList.add("is-empty");
    } else {
      cartWrapperDOMElement.classList.remove("is-empty");
    }
  };

  const deleteCartItem = (id) => {
    const cartItemDOMElement = cartDOMElement.querySelector(`[data-product-id="${id}"]`);

    cartDOMElement.removeChild(cartItemDOMElement);
    delete cart[id];
    updateCart();
  };

  const addCartItem = (data) => {
    const { id } = data;

    if (cart[id]) {
      increaseQuantity(id);
      return;
    }

    cart[id] = data;

    renderCartItem(data);
    updateCart();
  };

  const updateQuantity = (id, quantity) => {
    const cartItemDOMElement = cartDOMElement.querySelector(`[data-product-id="${id}"]`);
    const cartItemQuantityDOMElement = cartItemDOMElement.querySelector(".js-cart-item-quantity");
    const cartItemPriceDOMElement = cartItemDOMElement.querySelector(".js-cart-item-price");
    const cartItemInputPriceDOMElement = cartItemDOMElement.querySelector(".js-cart-input-price");
    const cartItemInputQuantityDOMElement = cartItemDOMElement.querySelector(".js-cart-input-quantity");

    cart[id].quantity = quantity;
    cartItemQuantityDOMElement.textContent = quantity;
    cartItemPriceDOMElement.textContent = quantity * cart[id].price;
    cartItemInputPriceDOMElement.value = quantity * cart[id].price;
    cartItemInputQuantityDOMElement.value = quantity;

    updateCart();
  };

  const decreaseQuantity = (id) => {
    const newQuantity = cart[id].quantity - 1;
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  const increaseQuantity = (id) => {
    const newQuantity = cart[id].quantity + 1;
    updateQuantity(id, newQuantity);
  };

  const generateID = (string1) => {
    return `${string1}`.replace(/ /g, "-");
  };

  const getProductData = (productDOMElement) => {

    const name = productDOMElement.querySelector(".popup__title").textContent;
    const price = productDOMElement.querySelector(".popup-product__price-value").textContent;
    const weight = productDOMElement.querySelector(".popup-product__weight").textContent;
    const src = productDOMElement.querySelector(".popup-product__img").getAttribute("src");
    const quantity = 1;
    const id = generateID(name);

    return { name, price, weight, src, quantity, id };
  };

  const renderCart = () => {
    const ids = Object.keys(cart);
    ids.forEach((id) => renderCartItem(cart[id]));
  };

  const resetCart = () => {
    const ids = Object.keys(cart);
    ids.forEach((id) => deleteCartItem(cart[id].id));
  };

  const cartInit = () => {
    renderCart();
    updateCart();

    document.addEventListener("reset-cart", resetCart);

    document.querySelector("body").addEventListener("click", (e) => {
      const target = e.target;

      if (target.classList.contains("js-btn-add-to-cart")) {
        e.preventDefault();
        const productDOMElement = target.closest(".js-product");
        const data = getProductData(productDOMElement);
        addCartItem(data);
      }
      if (target.classList.contains("js-btn-cart-item-remove")) {
        e.preventDefault();
        const cartItemDOMElement = target.closest(".js-cart-item");
        const productID = cartItemDOMElement.getAttribute("data-product-id");
        deleteCartItem(productID);
      }

      if (target.classList.contains("js-btn-product-increase-quantity")) {
        e.preventDefault();
        const cartItemDOMElement = target.closest(".js-cart-item");
        const productID = cartItemDOMElement.getAttribute("data-product-id");
        increaseQuantity(productID);
      }

      if (target.classList.contains("js-btn-product-decrease-quantity")) {
        e.preventDefault();
        const cartItemDOMElement = target.closest(".js-cart-item");
        const productID = cartItemDOMElement.getAttribute("data-product-id");
        decreaseQuantity(productID);
      }
      if (target.classList.contains("js-btn-product-attribute")) {
        e.preventDefault();
        const attribute = target.getAttribute("data-product-attribute-value");
        const price = target.getAttribute("data-product-attribute-price");
        const productDOMElement = target.closest(".js-product");
        const activeAttributeDOMElement = productDOMElement.querySelector(".js-btn-product-attribute.is-active");
        const productPriceDOMElement = productDOMElement.querySelector(".js-product-price-value");

        productPriceDOMElement.textContent = price;
        productDOMElement.setAttribute("data-product-attribute", attribute);
        productDOMElement.setAttribute("data-product-price", price);
        activeAttributeDOMElement.classList.remove("is-active");
        target.classList.add("is-active");
      }
    });
  };

  const cartCollapse = () => {
    var cartCollapseBtn = document.querySelector(".cart__collapse--btn");
    var sectionCardText = document.querySelector(".section__card--text");

    cartCollapseBtn.addEventListener("click", function () {
      cartWrapperDOMElement.classList.add("is-empty", "cart__collapse");
      sectionCardText.classList.add("cart__empty");
    });
  };

  const cartOpen = () => {
    var sectionCard = document.querySelector(".section__card--name");
    var sectionCardText = document.querySelector(".section__card--text");

    sectionCard.addEventListener("click", function () {
      cartWrapperDOMElement.classList.remove("is-empty", "cart__collapse");
    });
  };
  cartOpen();
  cartCollapse();

  cartInit();
})();

/* ================= cart end ========================= */

/* ================= radio start ========================= */

(function () {
  const optionsInputs = document.querySelectorAll(".options__input");

  const formInputAddress = document.querySelector(".form__input.address");
  const formInputFloor = document.querySelector(".form__input.floor");
  const formInputIntercom = document.querySelector(".form__input.intercom");

  const formSendBootom = document.querySelector(".form-send__bootom");

  optionsInputs.forEach((optionsInput) => {
    optionsInput.addEventListener("click", function (e) {
      const target = e.target;

      if (target.value === "delivery" && target.checked === true) {
        formSendBootom.classList.add("form-send__bootom--active");
      } else {
        formSendBootom.classList.remove("form-send__bootom--active");
      }
    });
  });
})();

/* ================= radio end ========================= */

/* ================= delivery start ========================= */

(function () {
  var cart = document.querySelector(".cart");

  if (cart === null) {
    return;
  }

  var changePopupDeliveryInfo = function (target) {
    var cartItems = document.querySelector(".cart__items");
    var delivery = document.querySelector(".popup-delivery");

    var cartItemTitles = cartItems.querySelectorAll(".cart-item__title");
    var cartItemPrices = cartItems.querySelectorAll(".js-cart-item-price");
    var cartItemWeights = cartItems.querySelectorAll(".cart-item__weight");
    var cartItemQuantitys = cartItems.querySelectorAll(".js-cart-item-quantity");
    var cartTotalPrice = document.querySelector(".js-cart-total-price").textContent;
    var cartTotalCountItems = document.querySelector(".js-cart-total-count-items").textContent;

    var cartTitlesArray = [];

    cartItemTitles.forEach((cartItemTitle) => {
      cartTitlesArray.push(cartItemTitle.textContent);
      delivery.querySelector(".order-info-title").setAttribute("value", cartTitlesArray);
    });

    var cartPricesArray = [];

    cartItemPrices.forEach((cartItemPrice) => {
      cartPricesArray.push(cartItemPrice.textContent);
      delivery.querySelector(".order-info-price").setAttribute("value", cartPricesArray);
    });

    var cartWeightsArray = [];

    cartItemWeights.forEach((cartItemWeight) => {
      cartWeightsArray.push(cartItemWeight.textContent);
      delivery.querySelector(".order-info-weight").setAttribute("value", cartWeightsArray);
    });

    var cartQuantitysArray = [];

    cartItemQuantitys.forEach((cartItemQuantity) => {
      cartQuantitysArray.push(cartItemQuantity.textContent);
      delivery.querySelector(".order-info-quantity").setAttribute("value", cartQuantitysArray);
    });

    delivery.querySelector(".order-info-total-price-input").setAttribute("value", cartTotalPrice);

    delivery.querySelector(".order-info-total-count-items").setAttribute("value", cartTotalCountItems);
  };

  cart.addEventListener("click", function (e) {
    target = e.target;

    if (target.classList.contains("popup-product__btn")) {
      e.preventDefault();
      changePopupDeliveryInfo(target);
    }
  });
})();

/* ================= delivery end ========================= */

/* ================= form start ========================= */

(function () {
  var forms = document.querySelectorAll(".form-send");

  if (forms.length === 0) {
    return;
  }

  var formValidate = function (form) {
    let error = 0;
    let formReq = form.querySelectorAll("._req");

    for (let i = 0; i < formReq.length; i++) {
      const input = formReq[i];
      console.log(input.value);
      if (input.value == "") {
        formAddError(input);
        console.log(input.value);
        error++;
      }
    }
    return error;
  };

  var formAddError = function (input) {
    input.classList.add("form__input--error");
    console.log(input);
  };

  var serialize = function (form) {
    var items = form.querySelectorAll("._serialize");
    var str = "";

    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      var name = item.name;
      var value = item.value;
      var separator = i === 0 ? "" : "&";
      console.log(item);
      if (value) {
        str += separator + name + "=" + value;
      }
    }

    return str;
  };

  var formSend = function (form) {
    var data = serialize(form);
    var xhr = new XMLHttpRequest();
    var url = "mail.php";

    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-unlencoded");

    xhr.onload = function () {
      let error = formValidate(form);

      console.log(error);

      if (error === 0) {
        if (xhr.response === "success") {
          document.querySelectorAll(".form__input").forEach(
            (item) => item.classList.remove("form__input--error")
          );
          document.querySelector(".popup-thanks").classList.add("is-active");
        } else {
          document.querySelectorAll(".form__input").forEach(
            (item) => item.classList.remove("form__input--error")
          );
          document.querySelector(".popup-delivery").classList.remove("is-active");
          document.querySelector(".popup-error").classList.add("is-active");
        }
      } else {
        alert(`Заповніть обов'язкові поля`);
      }

      form.reset();
    };

    xhr.send(data);
  };

  for (var i = 0; i < forms.length; i += 1) {
    forms[i].addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.currentTarget;
      formSend(form);
    });
  }
})();

/* ================= form end ========================= */