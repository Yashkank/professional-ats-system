/**
 * Resume Parsing Service
 * Handles file upload, text extraction, and AI-powered parsing
 */

// Mock resume parsing service
export class ResumeParserService {
  constructor() {
    this.supportedFormats = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    this.maxFileSize = 5 * 1024 * 1024 // 5MB
  }

  /**
   * Validate uploaded file
   */
  validateFile(file) {
    const errors = []

    if (!file) {
      errors.push('No file selected')
      return { isValid: false, errors }
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / 1024 / 1024}MB`)
    }

    if (!this.supportedFormats.includes(file.type)) {
      errors.push('File must be PDF, DOC, or DOCX format')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Upload file to server
   */
  async uploadFile(file) {
    try {
      const formData = new FormData()
      formData.append('resume', file)
      
      // Mock upload - replace with actual API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            url: `https://example.com/resumes/${file.name}`,
            filename: file.name,
            size: file.size
          })
        }, 1000)
      })

      return response
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`)
    }
  }

  /**
   * Extract text from uploaded file
   */
  async extractText(file) {
    try {
      // Mock text extraction - replace with actual service
      const extractedText = await new Promise((resolve) => {
        setTimeout(() => {
          // Simulate different resume formats
          const mockResumes = [
            // Format 1: Standard resume
            `
            JOHN DOE
            Software Engineer
            john.doe@email.com | (555) 123-4567 | San Francisco, CA
            linkedin.com/in/johndoe | github.com/johndoe

            PROFESSIONAL SUMMARY
            Experienced software engineer with 5+ years of experience in full-stack development.
            Skilled in Python, JavaScript, React, and cloud technologies.

            EXPERIENCE
            Senior Software Engineer | TechCorp Inc. | 2020-Present
            - Developed and maintained web applications using Python, Django, and React
            - Led team of 3 developers in building microservices architecture
            - Implemented CI/CD pipelines using Jenkins and Docker
            - Reduced application load time by 40% through performance optimization

            Software Engineer | StartupXYZ | 2018-2020
            - Built RESTful APIs using FastAPI and PostgreSQL
            - Developed frontend components using React and TypeScript
            - Collaborated with design team to implement responsive UI/UX

            EDUCATION
            Bachelor of Science in Computer Science
            University of California, Berkeley | 2018

            SKILLS
            Programming Languages: Python, JavaScript, TypeScript, Java, SQL
            Frameworks: Django, Flask, FastAPI, React, Node.js, Express
            Databases: PostgreSQL, MongoDB, Redis
            Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, Git
            Tools: Git, VS Code, Postman, Jira, Confluence

            CERTIFICATIONS
            AWS Certified Solutions Architect - Associate
            Google Cloud Professional Developer
            `,
            // Format 2: Modern resume
            `
            Sarah Johnson
            Full Stack Developer
            sarah.johnson@email.com | (555) 987-6543
            Portfolio: sarahjohnson.dev | GitHub: github.com/sarahj

            About Me
            Passionate full-stack developer with expertise in modern web technologies.
            I love building scalable applications and solving complex problems.

            Work Experience
            Lead Developer | InnovateTech | 2021 - Present
            • Architected and developed microservices using Node.js and Python
            • Implemented real-time features using WebSockets and Redis
            • Mentored junior developers and conducted code reviews
            • Improved system performance by 60% through optimization

            Full Stack Developer | WebSolutions | 2019 - 2021
            • Built responsive web applications using React and Vue.js
            • Developed REST APIs using Express.js and Django
            • Integrated third-party services and payment gateways
            • Collaborated with UX/UI designers to create intuitive interfaces

            Education
            Master of Science in Software Engineering
            Stanford University | 2019

            Technical Skills
            Frontend: React, Vue.js, TypeScript, HTML5, CSS3, Tailwind CSS
            Backend: Node.js, Python, Django, FastAPI, Express.js
            Databases: PostgreSQL, MongoDB, MySQL, Redis
            Cloud: AWS, Google Cloud, Azure, Docker, Kubernetes
            Tools: Git, GitHub Actions, Jenkins, VS Code, Figma

            Projects
            E-commerce Platform: Built full-stack e-commerce solution with React and Node.js
            Task Management App: Developed collaborative task management tool with real-time updates
            Data Visualization Dashboard: Created interactive dashboards using D3.js and Python
            `,
            // Format 3: Technical resume
            `
            Michael Chen
            Senior Python Developer
            michael.chen@email.com | (555) 456-7890 | Seattle, WA

            Summary
            Senior Python developer with 7+ years of experience in building scalable applications.
            Expert in data processing, machine learning, and cloud architecture.

            Professional Experience
            Senior Python Developer | DataFlow Systems | 2020 - Present
            - Designed and implemented data processing pipelines using Apache Airflow
            - Built machine learning models for predictive analytics using scikit-learn and TensorFlow
            - Developed RESTful APIs using FastAPI and PostgreSQL
            - Led migration of legacy systems to cloud-based architecture

            Python Developer | AnalyticsCorp | 2018 - 2020
            - Created data visualization tools using Plotly and Streamlit
            - Implemented ETL processes for large-scale data processing
            - Built automated testing frameworks using pytest and Selenium
            - Collaborated with data scientists to deploy ML models

            Software Engineer | TechStart | 2016 - 2018
            - Developed web applications using Django and Flask
            - Implemented real-time data processing using Celery and Redis
            - Built data APIs for mobile applications
            - Participated in agile development processes

            Education
            Bachelor of Science in Computer Science
            University of Washington | 2016

            Technical Skills
            Languages: Python, JavaScript, SQL, R, Bash
            Frameworks: Django, Flask, FastAPI, React, Express.js
            Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
            Cloud: AWS (EC2, S3, Lambda, RDS), Google Cloud Platform
            ML/AI: scikit-learn, TensorFlow, PyTorch, Pandas, NumPy
            Tools: Git, Docker, Kubernetes, Jenkins, Jupyter, VS Code

            Certifications
            AWS Certified Developer - Associate
            Google Cloud Professional Data Engineer
            Certified Kubernetes Administrator (CKA)
            `
          ]
          
          // Return random resume for demo
          const randomResume = mockResumes[Math.floor(Math.random() * mockResumes.length)]
          resolve(randomResume)
        }, 1500)
      })

      return {
        success: true,
        text: extractedText,
        wordCount: extractedText.split(' ').length,
        characterCount: extractedText.length
      }
    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`)
    }
  }

  /**
   * Parse resume text using AI
   */
  async parseResumeText(text) {
    try {
      // Mock AI parsing - replace with actual AI service
      const parsedData = await new Promise((resolve) => {
        setTimeout(() => {
          // Extract name (first line usually)
          const lines = text.split('\n').filter(line => line.trim())
          const name = lines[0]?.trim() || 'Unknown'
          
          // Extract email
          const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
          const email = emailMatch ? emailMatch[1] : ''
          
          // Extract phone
          const phoneMatch = text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)
          const phone = phoneMatch ? phoneMatch[1] : ''
          
          // Extract skills (look for common skill keywords)
          const skillKeywords = [
            'Python', 'JavaScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
            'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
            'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
            'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
            'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Slack',
            'HTML', 'CSS', 'TypeScript', 'Bootstrap', 'Tailwind', 'Sass',
            'REST', 'GraphQL', 'Microservices', 'CI/CD', 'DevOps',
            'Machine Learning', 'AI', 'Data Science', 'Analytics',
            'Agile', 'Scrum', 'TDD', 'BDD', 'Code Review'
          ]
          
          const foundSkills = skillKeywords.filter(skill => 
            text.toLowerCase().includes(skill.toLowerCase())
          )
          
          // Extract experience (look for experience section)
          const experienceMatch = text.match(/experience[:\s]*(.*?)(?=education|skills|certifications|projects|$)/is)
          const experience = experienceMatch ? experienceMatch[1].trim().substring(0, 500) : ''
          
          // Extract education
          const educationMatch = text.match(/education[:\s]*(.*?)(?=experience|skills|certifications|projects|$)/is)
          const education = educationMatch ? educationMatch[1].trim().substring(0, 300) : ''
          
          // Extract years of experience (rough estimate)
          const yearsMatch = text.match(/(\d+)\+?\s*years?/i)
          const yearsOfExperience = yearsMatch ? parseInt(yearsMatch[1]) : 0
          
          resolve({
            name,
            email,
            phone,
            skills: foundSkills,
            experience,
            education,
            yearsOfExperience,
            summary: this.generateSummary(name, foundSkills, yearsOfExperience),
            confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
          })
        }, 2000)
      })

      return {
        success: true,
        data: parsedData
      }
    } catch (error) {
      throw new Error(`Resume parsing failed: ${error.message}`)
    }
  }

  /**
   * Generate AI summary
   */
  generateSummary(name, skills, yearsOfExperience) {
    const skillCategories = {
      frontend: skills.filter(s => ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript'].includes(s)),
      backend: skills.filter(s => ['Python', 'Node.js', 'Django', 'Flask', 'FastAPI', 'Express'].includes(s)),
      database: skills.filter(s => ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'].includes(s)),
      cloud: skills.filter(s => ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'].includes(s))
    }

    const primarySkills = Object.values(skillCategories).flat().slice(0, 5)
    
    return `${name} is a ${yearsOfExperience > 0 ? `${yearsOfExperience}+ year` : 'skilled'} software developer with expertise in ${primarySkills.join(', ')}. ${yearsOfExperience > 3 ? 'Experienced' : 'Skilled'} in building scalable applications and working with modern technologies.`
  }

  /**
   * Calculate skill match with job requirements
   */
  calculateSkillMatch(candidateSkills, jobSkills) {
    if (!candidateSkills || !jobSkills || jobSkills.length === 0) {
      return { match: 0, matchedSkills: [], missingSkills: jobSkills || [] }
    }

    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase())
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase())
    
    const matchedSkills = jobSkillsLower.filter(jobSkill => 
      candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
      )
    )
    
    const missingSkills = jobSkillsLower.filter(jobSkill => 
      !candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(jobSkill) || jobSkill.includes(jobSkill)
      )
    )

    const matchPercentage = Math.round((matchedSkills.length / jobSkillsLower.length) * 100)

    return {
      match: matchPercentage,
      matchedSkills: matchedSkills.map(s => 
        jobSkills.find(js => js.toLowerCase() === s) || s
      ),
      missingSkills: missingSkills.map(s => 
        jobSkills.find(js => js.toLowerCase() === s) || s
      )
    }
  }

  /**
   * Generate cover letter using AI
   */
  async generateCoverLetter(resumeData, jobData) {
    try {
      // Mock AI cover letter generation
      const coverLetter = await new Promise((resolve) => {
        setTimeout(() => {
          const { name, skills, experience, yearsOfExperience } = resumeData
          const { title, company_name, description } = jobData
          
          const primarySkills = skills.slice(0, 5).join(', ')
          const experienceText = yearsOfExperience > 0 ? `${yearsOfExperience}+ years` : 'strong background'
          
          const letter = `
Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company_name}. With my ${experienceText} in software development and expertise in ${primarySkills}, I am confident that I would be a valuable addition to your team.

${experience ? `In my current role, I have ${experience.toLowerCase()}. ` : ''}My experience with modern technologies and frameworks aligns well with the requirements for this position. I am particularly excited about the opportunity to contribute to ${company_name}'s mission and would welcome the chance to discuss how my skills and experience can benefit your team.

I am passionate about building scalable, efficient solutions and thrive in collaborative environments. I believe my technical expertise and problem-solving abilities make me an ideal candidate for this role.

Thank you for considering my application. I look forward to the opportunity to discuss my qualifications further.

Best regards,
${name}
          `.trim()

          resolve(letter)
        }, 3000)
      })

      return {
        success: true,
        coverLetter
      }
    } catch (error) {
      throw new Error(`Cover letter generation failed: ${error.message}`)
    }
  }
}

// Export singleton instance
export const resumeParserService = new ResumeParserService()
export default resumeParserService

