import {
  AutoTokenizer,
  MusicgenForConditionalGeneration,
} from "@xenova/transformers";

// Load tokenizer and model
const tokenizer = await AutoTokenizer.from_pretrained("Xenova/musicgen-small");

const model = await MusicgenForConditionalGeneration.from_pretrained(
  "Xenova/musicgen-small",
  {
    dtype: {
      text_encoder: "q8",
      decoder_model_merged: "q8",
      encodec_decode: "fp32",
    },
  }
);

// Prepare text input
const prompt = "Country music with Banjo instruments and a flat drum. BPM: 120";
const inputs = tokenizer(prompt);

// Generate audio
const audio_values = await model.generate({
  ...inputs,
  max_new_tokens: 500,
  do_sample: true,
  guidance_scale: 3,
});

// (Optional) Write the output to a WAV file
import wavefile from "wavefile";
import fs from "fs";

const wav = new wavefile.WaveFile();
wav.fromScratch(
  1,
  model.config.audio_encoder.sampling_rate,
  "32f",
  audio_values.data
);
fs.writeFileSync("country.wav", wav.toBuffer());
