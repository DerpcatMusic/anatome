<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_IMAGES } from "$lib/features/landing/images";

  interface Props {
    instructor: {
      name: string;
      story: string;
    };
  }

  let { instructor }: Props = $props();

  const { t } = useI18n();

  const credentials = [
    {
      title: () => t.landing.instructor.credTrainingTitle(),
      body: () => t.landing.instructor.credTraining(),
    },
    {
      title: () => t.landing.instructor.credExperienceTitle(),
      body: () => t.landing.instructor.credExperience(),
    },
    {
      title: () => t.landing.instructor.credMissionTitle(),
      body: () => t.landing.instructor.credMission(),
    },
  ];
</script>

<section id="about" class="l-panel section--about" aria-label="על יובל">
  <div class="l-shell about">
    <div class="about__copy">
      <p class="l-eyebrow l-in">{t.landing.instructor.sectionEyebrow()}</p>
      <h2 class="about__greeting l-in">{t.landing.instructor.sectionHeadline()}</h2>
      <p class="about__role l-in l-in--1">{t.landing.instructor.subtitle()}</p>
      <p class="about__p l-in l-in--1">{t.landing.instructor.storyOrigin1()}</p>
      <p class="about__p l-in l-in--2">{t.landing.instructor.storyOrigin2()}</p>

      <div class="about__why l-in l-in--2">
        <h3 class="about__why-title">{t.landing.instructor.whyMeHeadline()}</h3>
        <div class="about__cred-grid">
          {#each credentials as cred, i (i)}
            <article class="about__cred l-in" class:l-in--1={i === 0} class:l-in--2={i === 1} class:l-in--3={i === 2}>
              <h4 class="about__cred-title">{cred.title()}</h4>
              <p class="about__cred-body">{cred.body()}</p>
            </article>
          {/each}
        </div>
      </div>

      <p class="about__p about__p--emphasis l-in l-in--3">{instructor.story}</p>
    </div>

    <figure class="about__figure l-in l-in--1">
      <div class="about__photo" data-landing-about-photo>
        <img
          class="about__photo-img"
          src={LANDING_IMAGES.aboutInstructor.src}
          alt={t.landing.images.aboutAlt() || ""}
          width={LANDING_IMAGES.aboutInstructor.width}
          height={LANDING_IMAGES.aboutInstructor.height}
          loading="lazy"
          decoding="async"
        />
      </div>
    </figure>
  </div>
</section>
