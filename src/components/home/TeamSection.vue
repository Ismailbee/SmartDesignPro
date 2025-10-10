<template>
  <section id="team" class="team-section">
    <div class="team-content">
      <h2 class="team-title">Meet Our Team</h2>
      <p class="team-subtitle">
        Talented designers and developers passionate about creating<br>
        exceptional digital experiences
      </p>

      <!-- Team Grid -->
      <div class="team-grid">
        <!-- Team Member 1 -->
        <div class="team-card">
          <div class="team-avatar">
            <img src="https://i.pravatar.cc/150?img=1" alt="Sarah Chen" />
          </div>
          <h3 class="team-name">Sarah Chen</h3>
          <p class="team-role">Creative Director</p>
          <p class="team-bio">
            Leading creative vision with 10+ years in brand design
          </p>
          <div class="team-skills">
            <span class="skill-tag">Brand Strategy</span>
            <span class="skill-tag">Art Direction</span>
            <span class="skill-tag">Team Leadership</span>
          </div>
        </div>

        <!-- Team Member 2 -->
        <div class="team-card">
          <div class="team-avatar">
            <img src="https://i.pravatar.cc/150?img=13" alt="Marcus Rodriguez" />
          </div>
          <h3 class="team-name">Marcus Rodriguez</h3>
          <p class="team-role">Senior UI/UX Designer</p>
          <p class="team-bio">
            Crafting intuitive digital experiences for global brands
          </p>
          <div class="team-skills">
            <span class="skill-tag">User Research</span>
            <span class="skill-tag">Prototyping</span>
            <span class="skill-tag">Design Systems</span>
          </div>
        </div>

        <!-- Team Member 3 -->
        <div class="team-card">
          <div class="team-avatar">
            <img src="https://i.pravatar.cc/150?img=5" alt="Emily Watson" />
          </div>
          <h3 class="team-name">Emily Watson</h3>
          <p class="team-role">Brand Designer</p>
          <p class="team-bio">
            Specializing in visual identity and brand storytelling
          </p>
          <div class="team-skills">
            <span class="skill-tag">Logo Design</span>
            <span class="skill-tag">Brand Guidelines</span>
            <span class="skill-tag">Print Design</span>
          </div>
        </div>

        <!-- Team Member 4 -->
        <div class="team-card">
          <div class="team-avatar">
            <img src="https://i.pravatar.cc/150?img=12" alt="David Kim" />
          </div>
          <h3 class="team-name">David Kim</h3>
          <p class="team-role">Web Developer</p>
          <p class="team-bio">
            Full-stack developer bringing designs to life
          </p>
          <div class="team-skills">
            <span class="skill-tag">React</span>
            <span class="skill-tag">Node.js</span>
            <span class="skill-tag">Performance Optimization</span>
          </div>
        </div>

        <!-- Team Member 5 -->
        <div class="team-card">
          <div class="team-avatar">
            <img src="https://i.pravatar.cc/150?img=9" alt="Lisa Thompson" />
          </div>
          <h3 class="team-name">Lisa Thompson</h3>
          <p class="team-role">Digital Strategist</p>
          <p class="team-bio">
            Data-driven marketing strategies that deliver results
          </p>
          <div class="team-skills">
            <span class="skill-tag">SEO</span>
            <span class="skill-tag">Analytics</span>
            <span class="skill-tag">Content Strategy</span>
          </div>
        </div>

        <!-- Team Member 6 -->
        <div class="team-card">
          <div class="team-avatar">
            <img src="https://i.pravatar.cc/150?img=14" alt="Alex Johnson" />
          </div>
          <h3 class="team-name">Alex Johnson</h3>
          <p class="team-role">Motion Designer</p>
          <p class="team-bio">
            Creating engaging animations and interactive experiences
          </p>
          <div class="team-skills">
            <span class="skill-tag">After Effects</span>
            <span class="skill-tag">Cinema 4D</span>
            <span class="skill-tag">Interactive Design</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// No script needed for this component
</script>

<style scoped>
/* Team Section */
.team-section {
  padding: 100px 80px;
  background: white;
}

.team-content {
  max-width: 1400px;
  margin: 0 auto;
}

.team-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #1e293b;
}

.team-subtitle {
  font-size: 18px;
  text-align: center;
  color: #64748b;
  margin-bottom: 60px;
  line-height: 1.6;
}

/* Team Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.team-card {
  background: #f8fafc;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  background: white;
}

.team-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 24px;
  border: 4px solid #06b6d4;
}

.team-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.team-role {
  font-size: 16px;
  color: #06b6d4;
  font-weight: 600;
  margin-bottom: 16px;
}

.team-bio {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
}

.team-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.skill-tag {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.team-card:hover .skill-tag {
  background: #f8fafc;
  border-color: #06b6d4;
  color: #06b6d4;
}

/* Responsive */
@media (max-width: 768px) {
  .team-section {
    padding: 60px 20px;
  }

  .team-title {
    font-size: 32px;
  }

  .team-subtitle {
    font-size: 16px;
  }

  .team-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>

