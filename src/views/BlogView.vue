<template>
  <div class="blog-layout">
    <v-card v-for="article in articles" :key="article.id"
      v-if="!article.params.hide"
      :width="300"
      :height="200"
      @click.stop="navigateTo(article)">

      <v-img class="white--text" max-width="300" max-height="200" aspect-ratio="1"
        src="https://cdn.vuetifyjs.com/images/cards/docks.jpg">
        <div class="blog-item-title fill-height">
          <div>{{ article.params.title }}</div>
          <div style="font-size: 0.8em">{{ $utils.fromNow(article.params.date, $i18n.lang.split('-')[0]) }}</div>
        </div>
      </v-img>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      articles: []
    }
  },
  watch: {},
  components: {
  },
  computed: {},
  methods: {
    navigateTo(article) {
      this.$router.push({ path: '/article', query: { data: article }})
    }
  },
  mounted() {
    // get articles
    this.$modules.waitForModule('articles').then(articles => {
      articles.get().then(result => {
        this.articles = result.articles
        console.log($j(this.articles))
      }).catch( err => { console.log(err) })
    })

    this.$db.collection('articles').then(articlesCollection => {
      notificationsCollection.dFind({}).then(docs => {
        this.articles = docs
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  },
  beforeDestroy() {

  }
}
</script>

<style>
.blog-layout {
  width: 100%;
  height: calc(100% - 0px);
  padding: 16px;
}

.blog-item-title {
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
  padding: 8px;
}
</style>
