<template>
  <div class="container-fluid mt-3">
    <!-- Header del carrito -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h5 mb-0 fw-bold">Tu Carrito</h1>
      <span class="badge bg-primary rounded-pill">{{ itemCount }} items</span>
    </div>

    <!-- Carrito vacío -->
    <div v-if="items.length === 0" class="alert alert-info text-center py-4">
      <i class="bi bi-cart-x fs-3"></i>
      <p class="mb-0 mt-2">Tu carrito está vacío</p>
    </div>

    <!-- Contenedor principal -->
    <div v-else class="row g-3">
      <!-- Columna de productos -->
      <div class="col-lg-8 pe-lg-3">
        <div class="card mb-3 shadow-sm" v-for="item in items" :key="item.id">
          <div class="row g-0">
            <!-- Imagen -->
            <div class="col-4 col-md-3 bg-light d-flex align-items-center p-2">
              <img :src="item.imagen || 'https://via.placeholder.com/300'"
                   class="img-fluid rounded-start"
                   style="object-fit: contain; max-height: 120px;">
            </div>

            <!-- Contenido -->
            <div class="col-8 col-md-9">
              <div class="card-body h-100 d-flex flex-column p-2 p-md-3">
                <!-- Título y botón eliminar -->
                <div class="d-flex justify-content-between mb-1">
                  <h5 class="card-title mb-0 fs-6 text-truncate">{{ item.nombre }}</h5>
                  <button @click="removeProduct(item.id)"
                          class="btn btn-sm btn-outline-danger p-1">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>

                <!-- Descripción -->
                <p v-if="item.descripcion" class="text-muted small mb-2 text-truncate">
                  {{ item.descripcion }}
                </p>

                <!-- Precio y controles -->
                <div class="d-flex justify-content-between align-items-center mt-auto">
                  <span class="text-primary fw-bold">${{ item.precio }}</span>

                  <div class="input-group input-group-sm" style="width: 110px;">
                    <button class="btn btn-outline-secondary py-0 px-2"
                            @click="updateQuantity(item.id, item.quantity - 1)"
                            :disabled="item.quantity <= 1">
                      -
                    </button>
                    <input type="text" class="form-control text-center py-0 px-1"
                           :value="item.quantity" readonly>
                    <button class="btn btn-outline-secondary py-0 px-2"
                            @click="updateQuantity(item.id, item.quantity + 1)">
                      +
                    </button>
                  </div>
                </div>

                <!-- Subtotal -->
                <div class="text-end mt-1 small">
                  <span class="text-muted">Subtotal: </span>
                  <span class="fw-bold">${{ (item.precio * item.quantity) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna del resumen -->
      <div class="col-lg-4">
        <div class="card shadow-sm sticky-lg-top cart-summary" style="top: 20px;">
          <div class="card-body">
            <h5 class="card-title border-bottom pb-2 mb-3">Resumen del Pedido</h5>

            <div class="d-flex justify-content-between mb-3">
              <span>Subtotal:</span>
              <span>${{ subtotal }}</span>
            </div>

            <div class="d-flex justify-content-between fw-bold border-top pt-3 mb-4">
              <span>Total:</span>
              <span>${{ subtotal }}</span>
            </div>

            <button @click="openWhatsApp"
                class="btn btn-success w-100 py-2 mb-2"
                :disabled="items.length === 0">
                <i class="bi bi-whatsapp me-2"></i>Enviar pedido por WhatsApp
            </button>

            <button @click="clearCart"
                    class="btn btn-outline-danger w-100 py-2"
                    :disabled="items.length === 0">
              <i class="bi bi-trash me-2"></i>Vaciar Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useCartStore } from '@/stores/cartStore';
import Swal from 'sweetalert2';

export default {
  computed: {
    ...mapState(useCartStore, ['items', 'itemCount']),
    subtotal() {
      return this.items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    },
    // Nuevo computed para el mensaje de WhatsApp
    whatsappMessage() {
      const products = this.items.map(item =>
        `${item.quantity}x ${item.nombre} - $${Math.round(item.precio)} c/u → $${Math.round(item.precio * item.quantity)}`
      ).join('%0A');

      return `*¡Hola!, estoy interesado en estos productos:*%0A%0A` +
            `*Pedido de la tienda*%0A%0A` +
             `*Productos:*%0A${products}%0A%0A` +
             `*Total:* $${Math.round(this.subtotal)}%0A%0A` +
             `*Datos del cliente:*%0A` +
             `Nombre: %0A` +
             `Dirección: %0A` +
             `Teléfono: %0A` +
             `Notas:`;
    }
  },
  methods: {
    ...mapActions(useCartStore, [
      'removeProduct',
      'updateQuantity',
      'clearCart'
    ]),
    // Nuevo método para abrir WhatsApp
    openWhatsApp() {
      const phoneNumber = '573216935710'; // Reemplaza con tu número real
      const url = `https://wa.me/${phoneNumber}?text=${this.whatsappMessage}`;
      window.open(url, '_blank');

      // Opcional: Limpiar el carrito después de enviar
      this.clearCart();
    },
      clearCart() {
        Swal.fire({
          title: '¿Vaciar el carrito?',
          text: 'Esta acción eliminará todos los productos del carrito.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, vaciar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            const cartStore = useCartStore();

            cartStore.clearCart();
            Swal.fire({
              icon: 'success',
              title: 'Carrito vacío',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
          }
        });
    }
  }
}
</script>

<style>
@media (max-width: 576px) {
  .cart-summary {
    background: white;
    padding-top: 1rem;
    margin-top: -1rem; /* Compensa el padding */
    position: relative;
    z-index: 2;
  }
}
</style>
