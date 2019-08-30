<template>
  <div class="blog-layout">
    <div class="blog-items">
      <div :id="'blogitem_' + article.params.id"
        class="blog-item elevation-2"
        v-for="article in articles" :key="article.params.id"
        v-if="!article.params.hide"
        @click.stop="navigateTo(article)">
        <div class="blog-item-content"
          :style="css(article)">
          <div class="blog-item-title"
            :style="'color: ' + (('' + article.params.dark) === 'true' ? 'white' : 'black')">
            <div>{{ article.params.title }}</div>
            <div style="font-size: 0.8em">
              {{ $utils.fromNow(article.params.date, $i18n.lang.split('-')[0]) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import loadjs from 'loadjs'

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
    css(article) {
      return 'background-image: ' + 'url(' + article.params.cover + ');'
    },
    loadMuuri() {
      return new Promise((resolve, reject) => {
        if (!loadjs.isDefined('muuri')) {
          loadjs([
            /* 'https://unpkg.com/interactjs@1.3.3/dist/interact.min.js', */
            'https://cdnjs.cloudflare.com/ajax/libs/web-animations/2.3.1/web-animations.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/muuri/0.5.4/muuri.js'
          ], 'muuri')

          loadjs.ready('muuri', {
            success: () => resolve(),
            error: err => reject(err)
          })
        } else {
          resolve()
        }
      })
    },
    async build() {
      try {
        if (this._grid) this._grid.destroy()
        delete this._grid

        await this.$utils.waitForProperty(global, 'Muuri')
        await this.$utils.waitForDOMReady('.blog-items')

        for (let article of this.articles) {
          let el = await this.$utils.waitForDOMReady('#blogitem_' + article.params.id)

          el.style('width', (article.params.width || 300) + 'px')
            .style('height', (article.params.height || 200) + 'px')
        }

        this._grid = new Muuri('.blog-items')
        d3.select('.blog-layout').style('opacity', 1)
      } catch (err) {
        console.log(err)
      }
    },
    navigateTo(article) {
      this.$store.commit('article', article)
      this.$router.push('/article')
    }
  },
  mounted() {
    // get articles
    this.$modules.waitForModule('articles').then(articles => {
      articles.get().then(result => {
        this.articles = result.articles

        this.loadMuuri().then(() => {
          this.build()
        }).catch(err => console.log(err))
      }).catch( err => { console.log(err) })
    })

    /*
    this.$db.collection('articles').then(articlesCollection => {
      notificationsCollection.dFind({}).then(docs => {
        this.articles = docs
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
    */
  },
  beforeDestroy() {

  }
}
</script>

<style>
.blog-layout {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  transition: opacity 0.5s ease;
  opacity: 0;
}

.blog-items {
  position: relative;
}

.blog-item {
  display: block;
  position: absolute;
  z-index: 1;
  margin: 2px;
  height: 200px;
  width: 300px;
}

.blog-item-content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  background-position: center;
  background-size: cover;
}

.blog-item-title {
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
  padding: 8px;
  width: 100%;
  height: 100%;
  text-shadow: black 4px 4px 1px 2px;
}

@media screen and (max-width: 600px) {
  .blog-item {
    width: calc(100vw - 4px)!important;
  }
}
</style>
