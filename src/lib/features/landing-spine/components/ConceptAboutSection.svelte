<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import StoryCard from "./StoryCard.svelte";

  function buildCredentials(
    t1: string, b1: string,
    t2: string, b2: string,
    t3: string, b3: string,
  ) {
    return [
      { title: t1, body: b1 },
      { title: t2, body: b2 },
      { title: t3, body: b3 },
    ];
  }

  const { t } = useI18n();

  const credentials = $derived(buildCredentials(
    t.landing.instructor.credTrainingTitle(),
    t.landing.instructor.credTraining(),
    t.landing.instructor.credExperienceTitle(),
    t.landing.instructor.credExperience(),
    t.landing.instructor.credMissionTitle(),
    t.landing.instructor.credMission(),
  ));

  const instructorStory = $derived(t.landing.instructor.storyClosing());
</script>

<StoryCard region="cervical" sectionIndex={1} id="about" ariaLabel="על יובל">
  <p class="concept-eyebrow">{t.landing.instructor.sectionEyebrow()}</p>
  <h2 class="concept-section-title">{t.landing.instructor.sectionHeadline()}</h2>
  <p class="concept-section-lead">{t.landing.instructor.subtitle()}</p>
  <p class="concept-body">{t.landing.instructor.storyOrigin1()}</p>
  <p class="concept-body">{t.landing.instructor.storyOrigin2()}</p>
  <h3 class="concept-section-title concept-section-title--small">
    {t.landing.instructor.whyMeHeadline()}
  </h3>
  <div class="concept-cred-grid">
    {#each credentials as cred (cred.title)}
      <article class="concept-cred">
        <h4>{cred.title}</h4>
        <p>{cred.body}</p>
      </article>
    {/each}
  </div>
  <p class="concept-body"><strong>{instructorStory}</strong></p>
  <figure class="concept-about__photo">
    <img
      src={LANDING_IMAGES.aboutInstructor.src}
      alt={t.landing.images.aboutAlt()}
      width={LANDING_IMAGES.aboutInstructor.width}
      height={LANDING_IMAGES.aboutInstructor.height}
      loading="lazy"
      decoding="async"
    />
  </figure>
</StoryCard>

<style>
  .concept-section-title--small {
    font-size: 1.25rem;
  }
</style>
