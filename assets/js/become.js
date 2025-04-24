document.addEventListener("DOMContentLoaded", () => {
    const API_SEND_EMAIL = "https://glowing-02bd61cbeff9.herokuapp.com/users/send-password-reset-email";
    const API_RESET_PASSWORD = "https://glowing-02bd61cbeff9.herokuapp.com/users/reset-password";

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
                Swal.fire({
                    title: "Error",
                    text: "Email is required!",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }

            const response = await fetch(API_SEND_EMAIL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) throw new Error("Failed to send OTP");

            Swal.fire({
                title: "Success",
                text: "OTP sent to your email!",
                icon: "success",
                confirmButtonText: "OK",
            });
            showOtpForm();
        } catch (error) {
            console.error("Error sending OTP:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to send OTP. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    // Verify OTP
    const verifyOtp = () => {
        const otp = document.getElementById("otp").value;
        if (otp) {
            showChangePasswordForm();
        } else {
            Swal.fire({
                title: "Error",
                text: "Please enter a valid OTP.",
                icon: "error",
                confirmButtonText: "OK",
            });
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
                Swal.fire({
                    title: "Error",
                    text: "Passwords do not match!",
                    icon: "error",
                    confirmButtonText: "OK",
                });
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

            Swal.fire({
                title: "Success",
                text: "Password changed successfully!",
                icon: "success",
                confirmButtonText: "OK",
            });
            resetForms();
        } catch (error) {
            console.error("Error changing password:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to change password. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
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