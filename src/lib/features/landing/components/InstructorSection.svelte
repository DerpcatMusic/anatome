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

<section id="instructor" class="content-section section--instructor" aria-label="המדריכה">
  <div class="instructor-split">
    <div class="instructor-visual">
      <div class="instructor-photo-placeholder">
        <span class="instructor-photo-label">
          {t.landing.instructor.photoPlaceholder()}
        </span>
      </div>
    </div>
    <div class="instructor-text">
      <span class="section-tag">{t.landing.instructor.tag()}</span>
      <h2>
        {instructor.name} — {t.landing.instructor.subtitle()}
      </h2>
      <p class="instructor-lead">
        {t.landing.instructor.lead()}
      </p>
      <p class="instructor-body">
        {t.landing.instructor.body({ years: instructor.years })}
      </p>
      <p class="instructor-story">{instructor.story}</p>
      <div class="instructor-creds">
        <div class="cred-item">
          <span class="cred-num">01</span>
          <span class="cred-label">{t.landing.instructor.cred1()}</span>
        </div>
        <div class="cred-item">
          <span class="cred-num">02</span>
          <span class="cred-label">{t.landing.instructor.cred2()}</span>
        </div>
        <div class="cred-item">
          <span class="cred-num">03</span>
          <span class="cred-label">{t.landing.instructor.cred3({ years: instructor.years })}</span>
        </div>
      </div>
    </div>
  </div>
</section>
