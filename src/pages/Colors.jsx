import { ThemeCustomizer } from "../components/event_maker/ThemeCustomizer.jsx";
import React from "react";
import {t} from "i18next";

export default function Colors() {
  return (
    <div className="w-full min-h-svh p-2 lg:p-8">
      <h1 className="text-3xl font-bold my-8">{t('themeCustomizer.title')}</h1>
      <ThemeCustomizer />
    </div>
  )
}

