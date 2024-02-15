require("dotenv").config();
const threadModel = require("./models/thread.js");
const OpenAI = require("openai");
const { toLocalDate } = require("./functions/toLocaleDate.js");

exports.try = async (req, res) => {
  try {
    res.status(200).json({ message: "hello" });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.askNewQuestion = async (req, res) => {
  try {
    const body = req.body; // Get the request body
    let sThread = body.sThread;
    const sAssistant = process.env["sAssistant"];

    const openai = new OpenAI({
      apiKey: process.env["OPENAI_API_KEY"],
    });

    // Check if it's a new conversation or an existing thread
    if (!body.sThread) {
      const oThread = await openai.beta.threads.create();
      sThread = oThread.id;
      const localDate = toLocalDate();
      const date = new Date();
      const thread = {
        threadID: sThread,
        dateCreated: localDate,
      };
      console.log(date);
      console.log(localDate);
      const data = new threadModel(thread);
      await data.save();
    }

    // Add a message to the thread
    await openai.beta.threads.messages.create(sThread, {
      role: "user",
      content: body.prompt,
    });

    // Run the assistant with the provided thread
    const run = await openai.beta.threads.runs.create(sThread, {
      assistant_id: sAssistant,
    });

    // Wait for the run to complete
    await waitForRunComplete(sThread, run.id);

    const threadMessages = await openai.beta.threads.messages.list(sThread);
    const pertanyaan = body.prompt;
    const jawaban = threadMessages.body.data[0].content[0].text.value;

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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    res.send({
      question: pertanyaan,
      answer: jawaban.split("【")[0].replace(/\n/g, "<br>"),
      threadID: sThread,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
