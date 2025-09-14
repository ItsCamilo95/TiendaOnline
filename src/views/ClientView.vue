<template>
  <div class="container mt-4 text-center">
    <h1 class="mb-4 ps-3">Bienvenido a <span class="text-primary shadow-sm rounded p-2">Mi tienda</span></h1>
    <p class="lead text-muted p-2">Descubre lo mejor en moda, maquillaje y cuidado personal. ¡Compra fácil, directo por WhatsApp!</p>

  <div class="mb-4 text-center">
    <img src="https://logos-world.net/wp-content/uploads/2023/01/Yanbal-Logo.png"
        class="img-fluid"
        alt="Banner"
        style="max-height: 120px; width: auto;">
  </div>

    <!-- Contenedor alineado a la derecha -->
    <div class="d-flex justify-content-between my-4">
      <div>
        <img src="https://logos-world.net/wp-content/uploads/2023/01/Yanbal-Logo.png"
       class="img-fluid"
       alt="Banner"
       style="max-height:40px;width: auto;">
      </div>
      <button
        @click="showCartModal"
        class="btn btn-primary position-relative d-flex align-items-center gap-2"
      >
        <i class="bi bi-cart-fill"></i> Carrito de Compras
        <span
          v-if="cartItemsCount > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        >
          {{ cartItemsCount }}
        </span>
      </button>
    </div>

    <hr>

    <!-- Modal del carrito -->
    <div class="modal fade" id="cartModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down modal-lg">
        <div class="modal-content h-100">
          <div class="modal-header">
            <h5 class="modal-title">Tu Carrito</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body d-flex flex-column pb-4">
            <CartView ref="cartView" @close-modal="hideCartModal" />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle del producto -->
    <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedProduct?.nombre }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 text-center">
                <img :src="selectedProduct?.imagen || 'https://via.placeholder.com/300'" class="img-fluid" style="max-height: 300px; object-fit: contain;">
              </div>
              <div class="col-md-6">
                <p class="fw-bold text-success fs-5">${{ selectedProduct?.precio }}</p>
                <p>{{ selectedProduct?.descripcion }}</p>
                <button class="btn btn-primary m-2 " @click="addToCart(selectedProduct)">
                  <i class="bi bi-cart-plus me-1"></i> Añadir al carrito
                </button>
                <a :href="whatsappLink" target="_blank" class="btn btn-success">
                  <i class="bi bi-whatsapp me-1 m-1"></i> Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Productos agrupados por categoría -->
    <div v-else>
      <div
        v-for="(items, categoria) in productosPorCategoria"
        :key="categoria"
        class="mb-5"
      >
        <h3 class="ps-2 mb-3 text-capitalize">{{ categoria }}</h3>
        <div class="d-flex flex-nowrap overflow-x-auto pb-3 px-2 hide-scrollbar">
          <div
            v-for="product in items"
            :key="product.id"
            class="col-8 col-sm-4 col-lg-3 px-2 flex-shrink-0"
          >
            <div class="card h-100 shadow-sm fade-in" @click="showProductModal(product)" style="cursor: pointer;">
              <img
                :src="product.imagen || 'https://via.placeholder.com/300'"
                class="card-img-top p-2"
                style="height: 200px; object-fit: contain;"
              >
              <div class="card-body">
                <h5 class="card-title">{{ product.nombre }}</h5>
                <p class="text-success fw-bold">${{ product.precio }}</p>
                <button
                  class="btn btn-primary btn-sm"
                  @click.stop="addToCart(product)"
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
        <hr>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";
import { mapState } from 'pinia';
import { useCartStore } from '@/stores/cartStore';
import CartView from './CartView.vue';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

export default {
  components: {
    CartView
  },
  data() {
    return {
      products: [],
      loading: true,
      cartModal: null,
      selectedProduct: null,
      productModal: null
    };
  },
  computed: {
    ...mapState(useCartStore, ['items', 'total']),
    cartItemsCount() {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    productosPorCategoria() {
      const agrupados = {};
      this.products.forEach(producto => {
        const categoria = producto.categoria || 'Sin categoría';
        if (!agrupados[categoria]) {
          agrupados[categoria] = [];
        }
        agrupados[categoria].push(producto);
      });
      return agrupados;
    },
    whatsappLink() {
      if (!this.selectedProduct) return '#';
      const mensaje = `Hola, estoy interesado en el producto "${this.selectedProduct.nombre}" que cuesta $${this.selectedProduct.precio}`;
      return `https://wa.me/573216935710?text=${encodeURIComponent(mensaje)}`;
    }
  },
  mounted() {
    this.cartModal = new Modal(document.getElementById('cartModal'));
    this.productModal = new Modal(document.getElementById('productModal'));
    this.loadProducts();
  },
  methods: {
    async loadProducts() {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      this.products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().Nombre,
        descripcion: doc.data().Descripcion,
        precio: parseFloat(doc.data().Precio),
        imagen: doc.data().Imagen,
        categoria: doc.data().Categoria
      }));
      this.loading = false;
    },
    addToCart(product) {
      const cartStore = useCartStore();
      cartStore.addProduct(product);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Producto agregado al carrito',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
      if (this.productModal) {
      this.productModal.hide();
  }
    },
    showCartModal() {
      this.cartModal.show();
      this.$nextTick(() => {
        if (window.innerWidth <= 576) {
          const summary = this.$refs.cartView?.$el?.querySelector('.cart-summary');
          if (summary) {
            setTimeout(() => {
              summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
          }
        }
      });
    },
    hideCartModal() {
      this.cartModal.hide();
    },
    showProductModal(product) {
      this.selectedProduct = product;
      this.productModal.show();
    }
  }
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  scrollbar-width: none;
}
.modal-body {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-bottom: 2rem;
}
@media (max-width: 576px) {
  .modal-content {
    margin: 0;
    border-radius: 0;
  }
}
.card-img-top {
  background-color: #f8f9fa;
}
.card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3em;
  line-height: 1.5em;
}
.fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
