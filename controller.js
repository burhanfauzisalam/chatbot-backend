require("dotenv").config();
const OpenAI = require("openai");

exports.try = async (req, res) => {
  try {
    res.status(200).json({ message: "hello" });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.askNewQuestion = async (req, res) => {
  try {
    let body = req.body; // Get the request body
    let sThread = body.sThread;
    sAssistant = process.env["sAssistant"];
    const openai = new OpenAI({
      apiKey: process.env["OPENAI_API_KEY"],
    });
    // Check if it's a new conversation or an existing thread
    if (!body.sThread) {
      let oThread = await openai.beta.threads.create();
      sThread = oThread.id;
    }

    // Add a message to the thread
    await openai.beta.threads.messages.create(sThread, {
      role: "user",
      content: body.prompt,
    });

    // Run the assistant with the provided thread
    let run = await openai.beta.threads.runs.create(sThread, {
      assistant_id: sAssistant,
    });

    // Wait for the run to complete
    await waitForRunComplete(sThread, run.id);

    // Retrieve messages from the thread
    const threadMessages = await openai.beta.threads.messages.list(sThread);
    const pertanyaan = body.prompt;
    const jawaban = threadMessages.body.data[0].content[0].text.value;
    // Send the thread messages and thread ID as a response
    res.send({
      question: pertanyaan,
      message: jawaban.split("【")[0].replace(/\n/g, "<br>"),
      threadID: sThread,
    });

    async function waitForRunComplete(sThreadId, sRunId) {
      while (true) {
        const oRun = await openai.beta.threads.runs.retrieve(sThreadId, sRunId);
        if (
          oRun.status &&
          (oRun.status === "completed" ||
            oRun.status === "failed" ||
            oRun.status === "requires_action")
        ) {
          break; // Exit loop if run is completed, failed, or requires action
        }
        // Delay the next check to avoid high frequency polling
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
