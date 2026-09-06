import { app, db } from "./firebase.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const auth = getAuth(app);

const cartItemsContainer =
    document.getElementById("cart-items");

const summaryItems =
    document.getElementById("summary-items");

const summarySubtotal =
    document.getElementById("summary-subtotal");

const summaryShipping =
    document.getElementById("summary-shipping");

const summaryTotal =
    document.getElementById("summary-total");

const checkoutButton =
    document.getElementById("checkout-btn");

let cart = [];
let currentUser = null;

async function loadCart() {

    if (!currentUser) {
        return;
    }

    try {
        const cartCollection =
            collection(
                db,
                "users",
                currentUser.uid,
                "cart"
            );

        const cartSnapshot =
            await getDocs(cartCollection);

        cart = [];

        cartSnapshot.forEach((doc) => {

            cart.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayCart();
        updateCartCount();

    } catch (error) {
        console.error(
            "Error loading cart:",
            error
        );
    }
}

function displayCart() {

    cartItemsContainer.innerHTML = "";

    const orderSummary =
        document.querySelector(".order-summary");

    if (cart.length === 0) {

        orderSummary.style.display = "none";

        cartItemsContainer.innerHTML = `
            <div class="empty-cart">

                <h2>Your Cart is Empty</h2>
                <p>
                    There are no items in your cart yet.
                </p>
                <a
                    href="shop.html"
                    class="continue-shopping"
                >
                    Continue Shopping
                </a>
            </div>
        `;
        return;
    }

    orderSummary.style.display = "block";

    cart.forEach((item) => {
        const cartItem =
            document.createElement("div");

        cartItem.classList.add(
            "cart-item"
        );

        cartItem.innerHTML = `
            <img
                src="${item.imageURL}"
                alt="${item.name}"
                class="cart-item-image"
            >

            <div class="cart-item-details">
                <h2>
                    ${item.name}
                </h2>
                <p class="cart-item-price">
                    R${(
                        Number(item.price) *
                        item.quantity
                    ).toFixed(2)}
                </p>
                <div class="quantity-controls">
                    <button
                        class="decrease-quantity"
                        data-id="${item.id}"
                    >
                        -
                    </button>
                    <span>
                        ${item.quantity}
                    </span>
                    <button
                        class="increase-quantity"
                        data-id="${item.id}"
                    >
                        +
                    </button>
                </div>

                <button
                    class="remove-item"
                    data-id="${item.id}"
                >
                    Remove
                </button>
            </div>
        `;

        cartItemsContainer.appendChild(
            cartItem
        );
    });

    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                item.quantity,
            0
        );

    const shipping =
        subtotal > 250
            ? 0
            : 35;

    const total =
        subtotal + shipping;

    const itemCount =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );

    summaryItems.textContent =
        itemCount;

    summarySubtotal.textContent =
        `R${subtotal.toFixed(2)}`;

    summaryShipping.textContent =
        shipping === 0
            ? "FREE"
            : `R${shipping.toFixed(2)}`;

    summaryTotal.textContent =
        `R${total.toFixed(2)}`;

    document
        .querySelectorAll(".increase-quantity")
        .forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    const productId =
                        button.dataset.id;

                    const item =
                        cart.find(
                            (item) =>
                                item.id ===
                                productId
                        );

                    if (!item) {
                        return;
                    }

                    item.quantity += 1;

                    await updateCartItem(
                        productId,
                        item.quantity
                    );
                }
            );
        });

    document
        .querySelectorAll(".decrease-quantity")
        .forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    const productId =
                        button.dataset.id;

                    const item =
                        cart.find(
                            (item) =>
                                item.id ===
                                productId
                        );

                    if (!item) {
                        return;
                    }

                    if (item.quantity > 1) {
                        item.quantity -= 1;

                        await updateCartItem(
                            productId,
                            item.quantity
                        );

                    } else {
                        await removeCartItem(
                            productId
                        );
                    }
                }
            );
        });

    document
        .querySelectorAll(".remove-item")
        .forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    const productId =
                        button.dataset.id;

                    await removeCartItem(
                        productId
                    );
                }
            );
        });
}

async function updateCartItem(
    productId,
    quantity
) {

    try {
        const cartItemRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "cart",
                productId
            );

        await updateDoc(
            cartItemRef,
            {
                quantity: quantity
            }
        );

        await loadCart();

    } catch (error) {

        console.error(
            "Error updating cart item:",
            error
        );
    }
}

async function removeCartItem(
    productId
) {
    try {
        const cartItemRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "cart",
                productId
            );

        await deleteDoc(
            cartItemRef
        );

        await loadCart();

    } catch (error) {
        console.error(
            "Error removing cart item:",
            error
        );
    }
}

function updateCartCount() {

    const cartCount =
        cart.reduce(
            (sum, item) =>
                sum + Number(item.quantity),
            0
        );

    document
        .querySelectorAll(".cart-count")
        .forEach((element) => {

            element.textContent =
                cartCount;
        });
}

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        currentUser = user;

        await loadCart();

    }
);

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        async () => {

            if (!currentUser) {
                return;
            }

            try {
                const cartCollection =
                    collection(
                        db,
                        "users",
                        currentUser.uid,
                        "cart"
                    );

                const cartSnapshot =
                    await getDocs(
                        cartCollection
                    );

                const deletePromises = [];

                cartSnapshot.forEach(
                    (cartDoc) => {

                        deletePromises.push(
                            deleteDoc(
                                cartDoc.ref
                            )
                        );
                    }
                );

                await Promise.all(
                    deletePromises
                );

                cart = [];
                displayCart();
                updateCartCount();

            } catch (error) {
                console.error(
                    "Error during checkout:",
                    error
                );
            }
        }
    );
}