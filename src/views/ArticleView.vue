<template>
  <div v-if="article" class="article-layout">
    <div class="article-header">
      <div class="article-title">
        {{ article.params.title }}
      </div>
      <div class="article-subtitle">
        {{ article.params.subtitle }}
      </div>
      <div class="article-date">
        {{ $utils.fromNow(article.params.date, $i18n.lang.split('-')[0]) }}</div>

      <a href="https://twitter.com/share?ref_src=twsrc%5Etfw"
        class="twitter-share-button"
        data-text="Nice revolution:"
        data-show-count="false">
        <v-img src="assets/icons/twitter.png" width="32" height="32"></v-img>
      </a>
    </div>
    <div  class="article-content">
      <div class="article-cover">
        <v-img :src="article.params.cover"
          max-height="200" aspect-ratio="1"></v-img>
      </div>
      <div v-html="article.content"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      article: null
    }
  },
  watch: {},
  components: {
  },
  computed: {
  },
  methods: {},
  mounted() {
    this.article = this.$store.state.article
  },
  beforeDestroy() {

  }
}
</script>

<style>
.article-layout {
  height: calc(100% - 0px);
  display: flex;
  flex-flow: column;
  align-items: center;
}

.article-header {
  position: relative;
  width: 952px;
  height: 96px;
  border-bottom: 1px solid gainsboro;
}

.article-title {
  font-size: 1.8em;
  font-variant: small-caps;
}

.article-date {
  font-size: 0.8em;
}

.article-cover {
  width: 706px;
  margin: 4px 0;
  padding: 2px;
  border: 1px solid gainsboro;
}

.article-content {
  width: 728px;
  height: calc(100% - 96px);
  text-align: justify;
  overflow-y: auto;
  padding: 0 8px;
}

.twitter-share-button {
  position: absolute;
  bottom: 0;
  right: 0;
}

@media screen and (max-width: 600px) {
  .article-header {
    width: 360px;
    text-align: center;
  }

  .article-cover {
    width: 360px;
    margin: 0 0 8px -8px;
    padding: 0;
  }

  .article-content {
    width: 360px;
  }
}
</style>
