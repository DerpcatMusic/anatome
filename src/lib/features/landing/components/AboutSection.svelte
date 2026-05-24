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

<section id="instructor" class="content-section" aria-label="על המדריכה">
  <div class="about-split">
    <div class="about-visual">
      <div class="about-photo-placeholder">
        <span class="about-photo-label">
          {t.landing.instructor.photoPlaceholder()}
        </span>
      </div>
    </div>
    <div class="about-text">
      <h2>{t.landing.philosophy.headline()}</h2>
      <p class="about-philosophy">
        {t.landing.instructor.lead()}
      </p>
      <p class="about-body">
        {t.landing.instructor.body({ years: instructor.years })}
      </p>
      <p class="about-story">{instructor.story}</p>
      <div class="about-creds">
        <div class="cred-item">{t.landing.instructor.cred1()}</div>
        <div class="cred-item">{t.landing.instructor.cred2()}</div>
        <div class="cred-item">{t.landing.instructor.cred3({ years: instructor.years })}</div>
      </div>
    </div>
  </div>
</section>
