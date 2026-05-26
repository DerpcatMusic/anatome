<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_IMAGES } from "$lib/features/landing/images";

  interface Props {
    instructor: {
      name: string;
      years: string;
      story: string;
    };
  }

  let { instructor }: Props = $props();

  const { t } = useI18n();

  const highlights = $derived([
    t.landing.instructor.storyPart3(),
    t.landing.instructor.storyPart4(),
    t.landing.instructor.marthaNote(),
  ]);
</script>

<section id="about" class="l-panel section--about" aria-label="על יובל">
  <div class="l-shell about">
    <div class="about__copy l-in">
      <h2 class="about__greeting">{t.landing.instructor.sectionHeadline()}</h2>
      <p class="about__role">{t.landing.instructor.subtitle()}</p>
      <p class="about__p">{t.landing.instructor.storyPart1()}</p>
      <p class="about__p">{t.landing.instructor.storyPart2()}</p>

      <ul class="about__list">
        {#each highlights as item (item)}
          <li>{item}</li>
        {/each}
      </ul>

      <p class="about__p about__p--emphasis">{instructor.story}</p>
    </div>

    <figure class="about__figure l-in l-in--1">
      <div class="about__photo">
        <img
          class="about__photo-img"
          src={LANDING_IMAGES.aboutInstructor.src}
          alt={t.landing.images.aboutAlt()}
          width={LANDING_IMAGES.aboutInstructor.width}
          height={LANDING_IMAGES.aboutInstructor.height}
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption class="about__stat">
        <span class="about__stat-value">{instructor.years}+</span>
        <span class="about__stat-label">{t.landing.instructor.statLabel()}</span>
      </figcaption>
    </figure>
  </div>
</section>
