    document.addEventListener("DOMContentLoaded", async () => {
        const API_URL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/me";
        const UPDATE_URL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/update-profile";
        const SEND_OTP_URL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/send-password-reset-email";
        const VERIFY_OTP_URL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/verify-otp";
        const CHANGE_PASSWORD_URL = "https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/reset-password";
        const token = localStorage.getItem("token");
      
        const fields = [
          { id: "profile-username", key: "username" },
          { id: "profile-email", key: "email" },
          { id: "profile-roles", key: "roles", isArray: true },
          { id: "store-name", key: "store_info.store_name" },
          { id: "store-address", key: "store_info.full_address" },
          { id: "store-nik", key: "store_info.nik" },
          { id: "store-status", key: "store_status" },
        ];
      
        // Toggle between edit and read-only mode
        const toggleEdit = (editMode) => {
          fields.forEach((field) => {
            const input = document.getElementById(field.id);
            if (input && field.id === "profile-username") {
              input.disabled = !editMode; // Only allow editing for the username
            }
          });
          document.getElementById("edit-profile-btn").classList.toggle("hidden", editMode);
          document.getElementById("save-profile-btn").classList.toggle("hidden", !editMode);
        };
      
        // Fetch user profile data
        const fetchProfile = async () => {
          try {
            const response = await fetch(API_URL, {
              headers: { Authorization: `Bearer ${token}` },
            });
      
            if (!response.ok) {
              throw new Error("Failed to fetch user profile.");
            }
      
            const { data } = await response.json();
      
            fields.forEach((field) => {
              const value =
                field.key.split(".").reduce((o, k) => (o || {})[k], data) || "-";
              const input = document.getElementById(field.id);
      
              if (field.key.startsWith("store_info") && !data.store_info) {
                document.getElementById("store-info").classList.add("hidden");
              } else if (field.key === "store_status" && !data.store_status) {
                document
                  .getElementById("store-status-container")
                  .classList.add("hidden");
              } else if (input) {
                input.value = field.isArray ? value.join(", ") : value;
              }
            });
          } catch (error) {
            console.error("Error fetching profile:", error);
            alert("Failed to load profile data.");
          }
        };
      
        // Save updated profile
        const saveProfile = async () => {
          try {
            const username = document.getElementById("profile-username").value;
      
            const response = await fetch(UPDATE_URL, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username }),
            });
      
            if (!response.ok) {
              throw new Error("Failed to update profile.");
            }
      
            alert("Profile updated successfully!");
            toggleEdit(false);
            await fetchProfile();
          } catch (error) {
            console.error("Error saving profile:", error);
            alert("Error updating profile.");
          }
        };
      
        // Send OTP
        const sendOtp = async () => {
          try {
            const email = document.getElementById("profile-email").value;
      
            const response = await fetch(SEND_OTP_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
      
            if (!response.ok) {
              throw new Error("Failed to send OTP.");
            }
      
            alert("OTP sent! Check your email.");
            document.getElementById("otp-section").classList.remove("hidden");
          } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP.");
          }
        };
      
        // Verify OTP
        const verifyOtp = async () => {
            const email = document.getElementById("profile-email").value; // Ambil email
            const otp = document.getElementById("otp").value; // Ambil OTP
          
            try {
              const response = await fetch("https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/verify-otp", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, reset_token: otp }),
              });
          
              if (!response.ok) {
                throw new Error("Invalid OTP.");
              }
          
              alert("OTP verified successfully!");
              document.getElementById("otp-section").classList.add("hidden");
              document.getElementById("change-password-section").classList.remove("hidden");
            } catch (error) {
              console.error("Error verifying OTP:", error);
              alert("Failed to verify OTP.");
            }
          };
          
          document.getElementById("verify-otp-btn").addEventListener("click", verifyOtp);
          
        // Change password
        const changePassword = async () => {
            const email = document.getElementById("profile-email").value; // Ambil email pengguna
            const otp = document.getElementById("otp").value; // Ambil OTP
            const newPassword = document.getElementById("new-password").value; // Password baru
            const confirmPassword = document.getElementById("confirm-password").value; // Konfirmasi password baru
          
            if (newPassword !== confirmPassword) {
              alert("Passwords do not match!");
              return;
            }
          
            try {
              const response = await fetch("https://tefae-commerce-2c0fdca4d608.herokuapp.com/users/reset-password", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email,
                  reset_token: otp,
                  new_password: newPassword,
                }),
              });
          
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to reset password.");
              }
          
              alert("Password changed successfully!");
              document.getElementById("change-password-form").reset();
              document.getElementById("change-password-section").classList.add("hidden");
            } catch (error) {
              console.error("Error changing password:", error);
              alert(error.message);
            }
          };
          
          document
            .getElementById("change-password-form")
            .addEventListener("submit", (e) => {
              e.preventDefault();
              changePassword();
            });
      
        // Event listeners
        document.getElementById("edit-profile-btn").addEventListener("click", () => toggleEdit(true));
        document.getElementById("save-profile-btn").addEventListener("click", saveProfile);
      
        document.getElementById("change-password-btn").addEventListener("click", sendOtp);
        document.getElementById("verify-otp-btn").addEventListener("click", verifyOtp);
        document.getElementById("cancel-otp-btn").addEventListener("click", () => {
          document.getElementById("otp-section").classList.add("hidden");
        });
      
        // Initialize
        await fetchProfile();
      });
      