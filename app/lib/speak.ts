export const speak = (
  text: string
) => {
  if (
    typeof window === "undefined"
  )
    return;

  if (
    !window.speechSynthesis
  )
    return;

  if (!text?.trim()) return;

  try {
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.rate = 0.95;

    utterance.pitch = 1;

    utterance.volume = 1;

    const voices =
      window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find((voice) =>
        voice.lang.includes("en")
      );

    if (preferredVoice) {
      utterance.voice =
        preferredVoice;
    }

    window.speechSynthesis.speak(
      utterance
    );
  } catch (err) {
    console.log(err);
  }
};