import { app, db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const auth = getAuth(app);
const productsContainer = document.getElementById("products");

if (productsContainer) {
  const productsCollection = collection(db, "products");
  const urlParams = new URLSearchParams(window.location.search);

  const category = urlParams.get("category");
  const backButton = document.querySelector(".back-to-shop");

  if (!category && backButton) {
    backButton.style.display = "none";
  }
  const shopTitle = document.getElementById("shop-title");
  const searchInput = document.getElementById("search-input");

  if (category && shopTitle) {
    shopTitle.textContent = category;
  }

  let productsQuery;

  if (category) {
    productsQuery = query(
      productsCollection,
      where("category", "==", category),
    );
  } else {
    productsQuery = productsCollection;
  }

  const productsSnapshot = await getDocs(productsQuery);

  const products = [];

  productsSnapshot.forEach((doc) => {
    products.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  function displayProducts(productsToDisplay) {
    productsContainer.innerHTML = "";

    if (productsToDisplay.length === 0) {
      productsContainer.innerHTML = `
                <div class="empty-cart">
                    <h2>No products found</h2>
                    <p>Try searching for something else.</p>
                </div>
            `;
      return;
    }

    productsToDisplay.forEach((product) => {
      const productElement = document.createElement("div");

      productElement.classList.add("product-card");

      productElement.innerHTML = `
                <img
                    src="${product.imageURL}"
                    alt="${product.name}"
                >

                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p class="product-price">
                        R${product.price}
                    </p>
                    <p class="product-category">
                        ${product.category}
                    </p>
                    <p class="product-description">
                        ${product.description}
                    </p>
                    <button class="add-to-cart">
                        Add to Cart
                    </button>
                </div>
            `;

      productsContainer.appendChild(productElement);

      const addToCartButton = productElement.querySelector(".add-to-cart");

      addToCartButton.addEventListener("click", () => {
        addToCart(product);
      });
    });
  }

  displayProducts(products);

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase().trim();

      const filteredProducts = products.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );
      });

      displayProducts(filteredProducts);
    });
  }
}

async function addToCart(product) {
  const user = auth.currentUser;

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const cartItemRef = doc(db, "users", user.uid, "cart", product.id);

    const cartItemSnapshot = await getDoc(cartItemRef);

    if (cartItemSnapshot.exists()) {
      const existingItem = cartItemSnapshot.data();

      await setDoc(cartItemRef, {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      });
    } else {
      await setDoc(cartItemRef, {
        name: product.name,
        price: Number(product.price),
        category: product.category,
        description: product.description,
        imageURL: product.imageURL,
        quantity: 1,
      });
    }

    await updateCartCount();

    showCartMessage(`${product.name} added to cart!`);
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}

function showCartMessage(message) {
  const messageElement = document.createElement("div");

  messageElement.classList.add("cart-message");

  messageElement.textContent = message;

  document.body.appendChild(messageElement);

  setTimeout(() => {
    messageElement.remove();
  }, 2000);
}

async function updateCartCount() {
  const user = auth.currentUser;

  if (!user) {
    document.querySelectorAll(".cart-count").forEach((element) => {
      element.textContent = "0";
    });

    return;
  }

  try {
    const cartCollection = collection(db, "users", user.uid, "cart");

    const cartSnapshot = await getDocs(cartCollection);

    let cartCount = 0;

    cartSnapshot.forEach((doc) => {
      const item = doc.data();

      cartCount += Number(item.quantity);
    });

    document.querySelectorAll(".cart-count").forEach((element) => {
      element.textContent = cartCount;
    });
  } catch (error) {
    console.error("Error updating cart count:", error);
  }
}

onAuthStateChanged(auth, () => {
  updateCartCount();
});

async function loadCategoryImages() {
  const categoryCards = document.querySelectorAll(".category-card");

  if (categoryCards.length === 0) {
    return;
  }

  try {
    const productsSnapshot = await getDocs(collection(db, "products"));

    const products = [];

    productsSnapshot.forEach((productDoc) => {
      products.push({
        id: productDoc.id,
        ...productDoc.data(),
      });
    });

    categoryCards.forEach((card) => {
      const category = card.dataset.category;

      const product = products.find((item) => item.category === category);

      const image = card.querySelector(".category-image");

      if (product && image) {
        image.src = product.imageURL;
      }
    });
  } catch (error) {
    console.error("Error loading category images:", error);
  }
}

loadCategoryImages();
