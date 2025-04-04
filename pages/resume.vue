<template>
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-heading font-bold text-primary mb-8">Resume</h1>
      
      <!-- Contact Information -->
      <div class="bg-background rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-heading font-bold text-secondary mb-4">Contact Information</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center">
            <FeatherIcon name="phone" class="text-accent mr-2" />
            <span>(+91) 80179 99653</span>
          </div>
          <div class="flex items-center">
            <FeatherIcon name="mail" class="text-accent mr-2" />
            <a href="mailto:panditsumitkumar@gmail.com" class="hover:text-accent">panditsumitkumar@gmail.com</a>
          </div>
        </div>
      </div>
      
      <!-- Experience -->
      <section class="mb-8">
        <h2 class="text-2xl font-heading font-bold text-secondary mb-6 border-b-2 border-secondary/20 pb-2">
          Professional Experience
        </h2>
        
        <div class="space-y-8">
          <div v-for="(job, index) in experience" :key="index" class="bg-background rounded-lg shadow-md p-6">
            <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 class="text-xl font-bold">{{ job.position }}</h3>
                <p class="text-lg text-primary">{{ job.company }}</p>
              </div>
              <p class="text-secondary font-medium mt-2 md:mt-0">{{ job.period }}</p>
            </div>
            <ul class="list-disc pl-5 space-y-2">
              <li v-for="(achievement, i) in job.achievements" :key="i" class="text-textColor">
                {{ achievement }}
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      <!-- Education -->
      <section class="mb-8">
        <h2 class="text-2xl font-heading font-bold text-secondary mb-6 border-b-2 border-secondary/20 pb-2">
          Education
        </h2>
        
        <div class="space-y-6">
          <div v-for="(edu, index) in academics" :key="index" class="bg-background rounded-lg shadow-md p-6">
            <div class="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h3 class="text-xl font-bold">{{ edu.degree }}</h3>
                <p class="text-lg text-primary">{{ edu.institution }}</p>
                <p v-if="edu.field" class="text-textColor">{{ edu.field }}</p>
              </div>
              <div class="mt-2 md:mt-0 text-right">
                <p class="text-secondary font-medium">{{ edu.date }}</p>
                <p class="text-textColor">{{ edu.percentage }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Skills -->
      <section class="mb-8">
        <h2 class="text-2xl font-heading font-bold text-secondary mb-6 border-b-2 border-secondary/20 pb-2">
          Skills
        </h2>
        
        <div class="flex flex-wrap gap-3">
          <SkillBadge v-for="skill in skills" :key="skill" :name="skill" />
        </div>
      </section>
      
      <!-- Recognitions -->
      <section>
        <h2 class="text-2xl font-heading font-bold text-secondary mb-6 border-b-2 border-secondary/20 pb-2">
          Recognitions & Awards
        </h2>
        
        <div class="space-y-4">
          <div v-for="(recognition, index) in recognitions" :key="index" class="bg-background rounded-lg shadow-md p-4">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 class="text-lg font-bold">{{ recognition.title }}</h3>
                <p class="text-primary">{{ recognition.organization }}</p>
              </div>
              <p class="text-secondary font-medium mt-2 md:mt-0">{{ recognition.date }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  const experience = [
    {
      company: "Cerner Healthcare Solutions India Pvt. Ltd.",
      position: "Software Engineer III",
      period: "Oct 2020 to Present",
      achievements: [
        "Designed workflow for enabling/disabling health record features on patient-portal",
        "Developed history view for results applet",
        "Enhanced reports and documents app to have single or multiple file download feature"
      ]
    },
    {
      company: "EY GDS India LLP",
      position: "Consultant I",
      period: "Oct 2018 to Oct 2020",
      achievements: [
        "Improved database procedure performance by 60% by optimising SQLScript statements",
        "Proposed design to document intercompany suspense balances for accounts reconciliation",
        "Created reports to document and evaluate financial impact of erroneous transactions for year end reporting"
      ]
    },
    {
      company: "IBM India Pvt. Ltd.",
      position: "Senior System Engineer",
      period: "Dec 2014 to Sep 2018",
      achievements: [
        "Developed various reports, interfaces, conversions, enhancements and forms as per business requirements for MM, PP, PS, OTC, RTR and RTC modules",
        "Contributed in multiple end to end implementation projects for Matthews Internationals, Tapestry Inc. and Zalora.",
        "Coached and mentored junior software developers and held training sessions to encourage culture of knowledge sharing and collaboration"
      ]
    }
  ]
  
  const academics = [
    {
      degree: "Bachelor of Technology",
      date: "Jun 2014",
      institution: "Vinoba Bhave University",
      field: "Chemical Engineering",
      percentage: "78.3 %"
    },
    {
      degree: "Senior Secondary Certificate Examination",
      date: "May 2010",
      institution: "Central Board of Secondary Education",
      field: "Maths",
      percentage: "82.8 %"
    },
    {
      degree: "Senior Secondary Examination",
      date: "Jun 2008",
      institution: "National Institute of Open Schooling",
      percentage: "79.8 %"
    }
  ]
  
  const skills = [
    "HTML", "JavaScript", "ABAP", "Ruby on Rails", "RWD", 
    "Redux", "Jenkins", "Accessibility", "Webpack", "CSS", 
    "Ruby", "React", "Git", "NPM", "Enzyme", "SASS", 
    "Jest", "Restful API"
  ]
  
  const recognitions = [
    { title: "Prod Champion", organization: "Cerner", date: "Jan 2022" },
    { title: "Manager Recognition", organization: "Cerner", date: "May 2021" },
    { title: "Star of the Week", organization: "Cerner", date: "Nov 2020" },
    { title: "Onsite Recognition Award", organization: "EY", date: "Jan 2020" },
    { title: "Spot Award", organization: "EY", date: "Oct 2019" },
    { title: "Eminence and Excellence Cash Award", organization: "IBM", date: "Nov 2017" },
    { title: "Manager's Choice Award", organization: "IBM", date: "Nov 2017, Aug 2017" },
    { title: "Deep Skill Adder Award", organization: "IBM", date: "Jan 2017, Oct 2016, Jul 2016, Apr 2016" },
    { title: "Manager Empowerment Fund Award", organization: "IBM", date: "Oct 2016" }
  ]
  </script>