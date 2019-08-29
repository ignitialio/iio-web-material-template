<template>
  <div class="products-layout">

  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  watch: {},
  components: {
  },
  computed: {},
  methods: {},
  mounted() {
    this.$db.collection('products').then(productsCollection => {
      notificationsCollection.dFind({}).then(docs => {
        this.products = docs
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  },
  beforeDestroy() {

  }
}
</script>

<style>
.products-layout {
  width: 100%;
  height: calc(100% - 0px);
}
</style>
