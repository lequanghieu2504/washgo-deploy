import { useTranslation } from "react-i18next";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center space-x-1 px-2 py-1 border rounded-md bg-white hover:bg-gray-100 transition">
        <span className="text-xl">{currentLang.flag}</span>
        <span className="text-sm">{currentLang.name}</span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
          {languages.map((lang) => (
            <Menu.Item key={lang.code}>
              {({ active }) => (
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`${
                    active ? "bg-gray-100" : ""
                  } flex items-center w-full px-3 py-2 text-sm`}
                >
                  <span className="text-xl mr-2">{lang.flag}</span>
                  {lang.name}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
