document.addEventListener("DOMContentLoaded", () => {
    const API_SEND_EMAIL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/send-password-reset-email";
    const API_RESET_PASSWORD = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/reset-password";
  
    const otpSection = document.getElementById("otp-section");
    const changePasswordSection = document.getElementById("change-password-section");
  
    // Show OTP form
    const showOtpForm = () => {
      otpSection.classList.remove("hidden");
    };
  
    // Show Change Password form
    const showChangePasswordForm = () => {
      changePasswordSection.classList.remove("hidden");
      otpSection.classList.add("hidden");
    };
  
    // Hide all forms
    const resetForms = () => {
      otpSection.classList.add("hidden");
      changePasswordSection.classList.add("hidden");
    };
  
    // Send OTP
    const sendOtp = async () => {
      try {
        const email = prompt("Enter your email address:");
        if (!email) {
          alert("Email is required!");
          return;
        }
  
        const response = await fetch(API_SEND_EMAIL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        if (!response.ok) throw new Error("Failed to send OTP");
  
        alert("OTP sent to your email!");
        showOtpForm();
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Failed to send OTP. Please try again.");
      }
    };
  
    // Verify OTP
    const verifyOtp = () => {
      const otp = document.getElementById("otp").value;
      if (otp) {
        showChangePasswordForm();
      } else {
        alert("Please enter a valid OTP.");
      }
    };
  
    // Change Password
    const changePassword = async () => {
      try {
        const email = prompt("Confirm your email address:");
        const otp = document.getElementById("otp").value;
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
  
        if (newPassword !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
  
        const response = await fetch(API_RESET_PASSWORD, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            reset_token: otp,
            new_password: newPassword,
          }),
        });
  
        if (!response.ok) throw new Error("Failed to change password");
  
        alert("Password changed successfully!");
        resetForms();
      } catch (error) {
        console.error("Error changing password:", error);
        alert("Failed to change password. Please try again.");
      }
    };
  
    // Event listeners
    document.getElementById("verify-otp-btn").addEventListener("click", verifyOtp);
    document.getElementById("submit-password-btn").addEventListener("click", changePassword);
    document.getElementById("cancel-otp-btn").addEventListener("click", resetForms);
    document.getElementById("cancel-password-btn").addEventListener("click", resetForms);
  
    // Trigger OTP process
    sendOtp();
  });      
