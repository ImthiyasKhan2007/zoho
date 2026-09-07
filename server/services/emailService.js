const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendDownAlert = async (userEmail, monitor) => {
    try {
        const result = await resend.emails.send({
            from: "Monitor X <onboarding@resend.dev>",
            to: userEmail,
            subject: `🔴 ${monitor.name} is DOWN`,
            html: `
                <h2>Monitor Alert</h2>
                <p><strong>${monitor.name}</strong> (${monitor.url}) appears to be down.</p>
                <p>Detected at: ${new Date().toLocaleString()}</p>
                <p>We'll keep checking and notify you when it's back up.</p>
            `,
        });
        console.log(`📧 Down alert email sent for "${monitor.name}"`, result.data?.id);
    } catch (error) {
        console.error("❌ Error sending down alert:", error.message);
    }
};

const sendUpAlert = async (userEmail, monitor) => {
    try {
        const result = await resend.emails.send({
            from: "Monitor X <onboarding@resend.dev>",
            to: userEmail,
            subject: `✅ ${monitor.name} is back UP`,
            html: `
                <h2>Monitor Recovered</h2>
                <p><strong>${monitor.name}</strong> (${monitor.url}) is back online.</p>
                <p>Recovered at: ${new Date().toLocaleString()}</p>
            `,
        });
        console.log(`📧 Recovery alert email sent for "${monitor.name}"`, result.data?.id);
    } catch (error) {
        console.error("❌ Error sending recovery alert:", error.message);
    }
};

module.exports = { sendDownAlert, sendUpAlert };