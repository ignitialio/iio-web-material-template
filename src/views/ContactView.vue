<template>
  <div class="contact-layout">
    <div class="contact-section">
      <div>
        <v-img src="assets/icons/twitter.png" width="32" height="32"></v-img>
      </div>
      <div class="contact-emails">
        <div style="width: calc(60% - 54px);" class="contact-emails-destination">

        </div>
        <div class="contact-emails-domain">
          <a href="https://twitter.com/share?ref_src=twsrc%5Etfw"
            data-text="@ignitial"
            data-show-count="false">
            @ignitial
          </a>
        </div>
      </div>
    </div>

    <v-divider style="margin: 48px 0;"></v-divider>

    <div class="contact-section">
      <div>
        <v-icon>email</v-icon>
      </div>
      <div class="contact-emails">
        <div class="contact-emails-destination">
          <div><span class="contact-description">{{ $t('Sales inquires') }}</span> sales</div>
          <div><span class="contact-description">{{ $t('Services and products support') }}</span> support</div>
          <div><span class="contact-description">{{ $t('Local business support and inquires') }}</span> local</div>
        </div>
        <div class="contact-emails-domain">
          @ignitial.com
        </div>
      </div>
    </div>
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
  },
  beforeDestroy() {

  }
}
</script>

<style>
.contact-layout {
  width: 100%;
  height: calc(100% - 0px);
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.contact-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.contact-emails {
  width: 720px;
  display: flex;
}

.contact-emails-destination {
  width: calc(60% - 48px);
  display: flex;
  flex-flow: column;
  align-items: flex-end;
  padding: 0 16px;
  border-right: 1px solid gainsboro;
  color: orange;
}

.contact-emails-domain {
  width: 30%;
  padding: 0 16px;
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
  height: 100%;
}

.contact-description {
  color: dimgray;
  font-style: italic;
}
</style>
