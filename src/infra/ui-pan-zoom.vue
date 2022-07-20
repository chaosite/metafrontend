<template>
  <div ref="panZoomArea" class="pan-zoom-area">
    <slot ref="resultGraphSvg"/>
  </div>
</template>

<script>
import { Pan, Zoom } from '../infra/ui-pan-zoom';

export default {
  mounted() {
    this.pan = new Pan(this.$refs.panZoomArea);
    this.zoom = new Zoom(this.$refs.panZoomArea);
    this.zoom.setZoom = z => this.$el.style.setProperty('--zoom', z);
  }
}
</script>