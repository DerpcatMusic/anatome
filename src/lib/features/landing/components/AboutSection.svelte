<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    instructor: {
      name: string;
      years: string;
      story: string;
    };
  }

  let { instructor }: Props = $props();

  const { t } = useI18n();
</script>

<section id="about" class="l-panel l-section section--about" aria-label="על יובל">
  <div class="l-shell about">
    <div class="about__copy l-in">
      <h2 class="about__title">{t.landing.instructor.tag()}</h2>
      <p class="about__p">{t.landing.instructor.storyPart1()}</p>
      <p class="about__p">{t.landing.instructor.storyPart2()}</p>
      <p class="about__p">{t.landing.instructor.storyPart3()}</p>
      <p class="about__p about__p--emphasis">{t.landing.instructor.storyPart4()}</p>
      <p class="about__p">{instructor.story}</p>
      <p class="about__martha">{t.landing.instructor.marthaNote()}</p>
    </div>

    <div class="about__photo l-in l-in--1" aria-hidden="true">
      <span class="about__photo-mark">י.ד</span>
      <span class="about__photo-caption">{t.landing.instructor.photoPlaceholder()}</span>
    </div>
  </div>
</section>
