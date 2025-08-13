import { useState } from "react";
import Navbar from "../Navbar";

import ReturnList from "./ReturnList";
import ReturnForm from "./ReturnForm";

export default function ReturnPage() {
  const [section, setSection] = useState({
    returnsList: true,
    returnForm: false,
  });

  return (
    <main className="flex w-full flex-col gap-5 px-20 max-xl:px-5">
      <Navbar />

      {section.returnsList && (
        <ReturnList section={section} setSection={setSection} />
      )}
      {section.returnForm && <ReturnForm />}
    </main>
  );
}
