// src/pages/welcome-guide.js
function renderWelcomeGuidePage(container, userType) {
    // Define steps based on user type
    let steps;
    
    if (userType === 'student') {
      steps = [
        {
          title: "Welcome to Tzuru!",
          content: "As a student, Tzuru is designed to help you learn at your own pace. Let's take a quick tour of the features that will support your learning journey.",
          icon: "👋"
        },
        {
          title: "Ask Questions Anytime",
          content: "Our AI is here to help you understand difficult concepts. Just type your question, and get helpful, clear explanations—never just answers.",
          icon: "❓"
        },
        {
          title: "Learn Your Way",
          content: "Everyone learns differently. Tzuru adapts to your learning style, providing explanations that make sense to you and at a pace that works for you.",
          icon: "🧠"
        },
        {
          title: "Privacy & Security",
          content: "Your learning data stays local on your device. We don't track your questions or store your data in the cloud, ensuring your educational journey remains private.",
          icon: "🔒"
        },
        {
          title: "You're All Set!",
          content: "You're ready to start learning with Tzuru. Remember, Tzuru is here to support your learning—not to do your work for you. Let's start exploring!",
          icon: "🚀"
        }
      ];
    } else if (userType === 'teacher') {
      steps = [
        {
          title: "Welcome to Tzuru for Teachers!",
          content: "Tzuru is designed to support your teaching goals while keeping you in control. Let's explore how Tzuru can help enhance your classroom experience.",
          icon: "👋"
        },
        {
          title: "Create Lesson Plans",
          content: "Upload your weekly lesson plans and Tzuru will help provide supplementary materials, examples, and explanations tailored to your curriculum.",
          icon: "📚"
        },
        {
          title: "Personalized Support",
          content: "Each student learns differently. Tzuru adapts to provide explanations that match individual learning styles, giving every student the support they need.",
          icon: "🧩"
        },
        {
          title: "You Stay in Control",
          content: "Tzuru never replaces your expertise. It simply supports your teaching by providing additional resources while you maintain full control of your classroom.",
          icon: "🔄"
        },
        {
          title: "Privacy & Security",
          content: "Student data never leaves their devices. Our commitment to privacy ensures a safe, ethical learning environment for all your students.",
          icon: "🔒"
        },
        {
          title: "You're Ready to Begin!",
          content: "You're all set to enhance your teaching with Tzuru. Remember, you're always in control—Tzuru is just here to support your vision for your classroom.",
          icon: "🚀"
        }
      ];
    } else {
      steps = [
        {
          title: "Welcome to Your Personal Tzuru!",
          content: "Tzuru is now your personal AI learning companion. Let's explore how you can customize Tzuru to support your unique learning journey.",
          icon: "👋"
        },
        {
          title: "Personalized Learning",
          content: "Ask anything, anytime. Tzuru adapts to your learning style and pace, providing explanations that make sense to you.",
          icon: "🧠"
        },
        {
          title: "Upload Your Materials",
          content: "Add your own documents, research papers, notes, or any learning material. Tzuru will analyze them and help you understand and connect ideas.",
          icon: "📄"
        },
        {
          title: "Customize Your Experience",
          content: "Adjust settings to tailor Tzuru's responses to your preferences. You control how detailed or concise the explanations should be.",
          icon: "⚙️"
        },
        {
          title: "Privacy First",
          content: "Your data stays on your device. We don't track your questions or store your documents in the cloud, ensuring your learning remains private.",
          icon: "🔒"
        },
        {
          title: "You're Ready to Begin!",
          content: "You're all set to start your personalized learning journey with Tzuru. Let's discover new ideas together!",
          icon: "🚀"
        }
      ];
    }
    
    // Current step tracker
    let currentStep = 0;
    
    // Render initial step
    renderStep();
    
    // Function to render current step
    function renderStep() {
      const step = steps[currentStep];
      
      container.innerHTML = `
        <div class="container flex flex-center flex-column" style="height: 100vh;">
          <div class="logo-container">
            <img src="src/assets/images/logo.png" alt="Tzuru Logo" class="logo">
            <h1 style="margin-left: 15px; color: #4A2707;">Tzuru</h1>
          </div>
          
          <div class="welcome-guide">
            <div class="card guide-step">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="flex: 2; padding: 20px;">
                  <h2 style="color: #4A2707; margin-bottom: 15px;">${step.title}</h2>
                  <p style="font-size: 16px; line-height: 1.5;">${step.content}</p>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="width: 150px; height: 150px; background-color: #F47834; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                    <span style="font-size: 60px;">${step.icon}</span>
                  </div>
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-top: 30px;">
                <button 
                  class="btn btn-secondary"
                  id="back-btn"
                  ${currentStep === 0 ? 'disabled' : ''}
                  style="opacity: ${currentStep === 0 ? 0.6 : 1}; cursor: ${currentStep === 0 ? 'not-allowed' : 'pointer'};"
                >
                  Back
                </button>
                
                <div>
                  ${currentStep < steps.length - 1 ? `
                    <button 
                      style="background: none; border: none; color: #666; margin-right: 15px; cursor: pointer;"
                      id="skip-btn"
                    >
                      Skip Tour
                    </button>
                  ` : ''}
                  
                  <button class="btn" id="next-btn">
                    ${currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
                  </button>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <div style="display: flex; justify-content: center; gap: 8px;">
                ${steps.map((_, index) => `
                  <div 
                    style="width: 10px; height: 10px; border-radius: 50%; background-color: ${index === currentStep ? '#F47834' : '#E0E0E0'};"
                  ></div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners
      document.getElementById('next-btn').addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          renderStep();
        } else {
          // Navigate to chat
          navigateToPage('chat');
        }
      });
      
      document.getElementById('back-btn').addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          renderStep();
        }
      });
      
      if (currentStep < steps.length - 1) {
        document.getElementById('skip-btn').addEventListener('click', () => {
          navigateToPage('chat');
        });
      }
    }
  }