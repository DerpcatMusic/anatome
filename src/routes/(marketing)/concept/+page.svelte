<script lang="ts">
  import SEO from "$components/seo/SEO.svelte";
  import { SITE } from "$lib/seo/config";
  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import ConceptLanding from "$lib/features/landing-spine/components/ConceptLanding.svelte";
</script>

<SEO
  title="Spine Story — רעיון עיצובי"
  description="רעיון לדף נחיתה אינטראקטיבי של AnatoMe — מסע לאורך עמוד השדרה."
  canonical={`${SITE.domain}/concept`}
  noindex={true}
  nofollow={false}
  preloadImage={LANDING_IMAGES.sessions.anatomy.src}
/>

<ConceptLanding />
