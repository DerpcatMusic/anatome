<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="content-section section--pillars" aria-label="השירותים">
  <div class="section-header section-header--center">
    <span class="section-tag">{t.landing.pillars.tag()}</span>
    <h2>{t.landing.pillars.headline()}</h2>
  </div>
  <div class="pillars-grid">
    <article class="pillar">
      <span class="pillar-num">01</span>
      <h3>{t.landing.pillars.recordedTitle()}</h3>
      <p class="pillar-lead">{t.landing.pillars.recordedLead()}</p>
      <p class="pillar-body">{t.landing.pillars.recordedBody()}</p>
    </article>
    <article class="pillar">
      <span class="pillar-num">02</span>
      <h3>{t.landing.pillars.liveTitle()}</h3>
      <p class="pillar-lead">{t.landing.pillars.liveLead()}</p>
      <p class="pillar-body">{t.landing.pillars.liveBody()}</p>
    </article>
    <article class="pillar">
      <span class="pillar-num">03</span>
      <h3>{t.landing.pillars.privateTitle()}</h3>
      <p class="pillar-lead">{t.landing.pillars.privateLead()}</p>
      <p class="pillar-body">{t.landing.pillars.privateBody()}</p>
    </article>
  </div>
</section>
