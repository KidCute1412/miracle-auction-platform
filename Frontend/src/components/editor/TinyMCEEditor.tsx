
import { Editor } from "@tinymce/tinymce-react";

export default function TinyMCEEditor(props: {
  editorRef: any;
  value?: string;
  onEditChange?: any;
  isReadOnly?: boolean;
}) {
  const { editorRef, value, isReadOnly = false } = props;
  return (
    <>
      <Editor
        apiKey={`${import.meta.env.VITE_TINY_MCE}`}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          if (isReadOnly) {
            editor.mode.set("readonly");
          }
        }}
        onEditorChange={props.onEditChange}
        initialValue={value}
        disabled={isReadOnly}
        init={{
          height: 400,
          menubar: !isReadOnly,
          toolbar: `undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help`,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
        }}
      />
    </>
  );
}
