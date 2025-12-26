
import Bytez from "bytez.js"

const key = "868b08a85d9af6e5144ba2c7c8994c99"
const sdk = new Bytez(key)

async function test() {
  const model = sdk.model("Qwen/Qwen3-0.6B")
  const { error, output } = await model.run([
    {
      "role": "user",
      "content": "Hello"
    }
  ])
  console.log({ error, output });
}

test();
