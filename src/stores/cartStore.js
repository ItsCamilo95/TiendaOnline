import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  total: 0
  }),
  actions: {
    addProduct(product) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
            id: product.id,
            nombre: product.nombre,
            descripcion: product.descripcion, // ← Asegúrate de incluir esto
            precio: product.precio,
            imagen: product.imagen,
            quantity: 1
        })
      }
      
      this.calculateTotal()
    },
    removeProduct(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.calculateTotal()
    },
    updateQuantity(productId, newQuantity) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        item.quantity = newQuantity
        this.calculateTotal()
      }
    },
    calculateTotal() {
      this.total = this.items.reduce((sum, item) => {
        return sum + (item.precio * item.quantity)
      }, 0)
    },
    clearCart() {
      this.items = []
      this.total = 0
    }
  },
  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    }
  }
})