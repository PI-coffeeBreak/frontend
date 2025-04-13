import React from "react";
import { useParams } from "react-router-dom";
import { PageEditor } from "./PageEditor";

export function PageEditorWrapper() {
    const { pageTitle } = useParams();

    return (
        <div>
            {pageTitle ? (
                <PageEditor mode="edit" /> // Pass "edit" mode if pageTitle exists
            ) : (
                <PageEditor mode="create" /> // Pass "create" mode if no pageTitle
            )}
        </div>
    );
}