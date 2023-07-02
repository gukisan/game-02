class Remote {
  private systemMessage = SYSTEM_DATA.world.hero.language.system
  private clarification = SYSTEM_DATA.world.hero.language.clarification

  async queryHuggingFace(data) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        headers: {
          Authorization: `Bearer ${useRuntimeConfig().HUGGINGFACE_TOKEN}`,
        },
        method: "POST",
        body: "",
      }
    )
    const result = await response.json()
    return result
  }

  async queryOpenAI(data, apiKey: "betterGPT" | "custom" = "betterGPT") {
    const controller = new AbortController()

    const request: { [index: string]: any } = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${useRuntimeConfig().OPEN_AI_KEY}`,
      },
      method: "POST",
      body: JSON.stringify(data),
      signal: controller.signal,
    }
    let endpoint = ""
    if (apiKey === "betterGPT") {
      delete request.headers
      endpoint = "https://free.churchless.tech/v1/chat/completions"
    } else {
      endpoint = "https://api.openai.com/v1/chat/completions"
    }

    const response = await fetch(endpoint, request)

    if (!response.body) {
      throw new Error("ReadableStream not supported")
    }
    const reader = response.body.getReader()
    let result = ""
    let done = false
    let wrongResponse = false

    while (!done) {
      const { value, done: streamDone } = await reader.read()
      if (streamDone) {
        done = true
      } else {
        const newText = new TextDecoder().decode(value)
        if (!JSON.parse(newText).choices[0]) {
          wrongResponse = true
          break
        }
        SYSTEM_DATA.refs.output +=
          JSON.parse(newText).choices[0].message.content
        result += newText
      }
    }
    if (wrongResponse) {
      await this.queryOpenAI(data)
    } else {
      reader.releaseLock()
      controller.abort()
      return JSON.parse(result)
    }
  }

  data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: this.systemMessage,
      },
    ],
    temperature: 1,
    stream: false,
  }
  pushNewMessages() {
    this.data.messages.push({
      role: "user",
      content: SYSTEM_DATA.refs.input.value,
    })
    this.data.messages.push({
      role: "system",
      content: this.clarification,
    })
  }
  clampData() {
    if (this.data.messages.length > 10) {
      this.data.messages.splice(1, 3)
    }
  }
}

export const REMOTE = new Remote()
