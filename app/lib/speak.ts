export const speak = (text: string) => {
  if (typeof window === "undefined") return;

  if (!window.speechSynthesis) return;

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.cancel();

  window.speechSynthesis.speak(utterance);
};