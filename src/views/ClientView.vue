<template>
  <div class="container mt-4">
    <h1 class="mb-4 ps-3">Nuestros Productos</h1>

    <!-- Botón del carrito -->
    <button 
      @click="showCartModal"
      class="btn btn-primary position-relative mb-3"
    >
      Carrito
      <span 
        v-if="cartItemsCount > 0" 
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      >
        {{ cartItemsCount }}
      </span>
    </button>

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
            <div class="card h-100 shadow-sm">
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
                  @click="addToCart(product)"
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
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

export default {
  components: {
    CartView
  },
  data() {
    return {
      products: [],
      loading: true,
      cartModal: null
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
    }
  },
  mounted() {
    this.cartModal = new Modal(document.getElementById('cartModal'));
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
</style>
