<template>
  <div class="services-layout">

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
    this.$db.collection('services').then(servicesCollection => {
      notificationsCollection.dFind({}).then(docs => {
        this.services = docs
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  },
  beforeDestroy() {

  }
}
</script>

<style>
.services-layout {
  width: 100%;
  height: calc(100% - 0px);
}
</style>
