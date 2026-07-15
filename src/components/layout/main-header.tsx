import LanguageSwitcher from "../language-switcher";
import { ModeToggle } from "../theme-switcher";

export default function MainHeader() {
  return (
    <div className=" container flex gap-3 items-center justify-between py-3">
      <LanguageSwitcher />
      <ModeToggle />
    </div>
  );
}
