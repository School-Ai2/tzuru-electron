import sys
import json
import fitz  # PyMuPDF

def extract_hierarchy(pdf_path):
    doc = fitz.open(pdf_path)
    toc = doc.get_toc()  # Each entry: [level, title, page_number]

    if not toc:
        full_text = ""
        for page in doc:
            full_text += page.get_text()

        return {
            "chapters": [{
                "id": "0",
                "title": "Document",
                "content": full_text.strip(),
                "subchapters": []
            }]
        }

    # Step 1: Separate chapter (level 1) and subchapter (level 2) entries
    structure = []
    current_chapter = None

    for i, entry in enumerate(toc):
        level, title, page = entry
        if level == 1:
            if current_chapter:
                structure.append(current_chapter)
            current_chapter = {
                "title": title,
                "start_page": page,
                "subchapters": []
            }
        elif level == 2 and current_chapter:
            current_chapter["subchapters"].append({
                "title": title,
                "start_page": page
            })

    if current_chapter:
        structure.append(current_chapter)

    # Step 2: Append end markers
    for i, chapter in enumerate(structure):
        if i < len(structure) - 1:
            chapter["end_page"] = structure[i + 1]["start_page"]
        else:
            chapter["end_page"] = doc.page_count + 1  # +1 for exclusive range

        for j, sub in enumerate(chapter["subchapters"]):
            if j < len(chapter["subchapters"]) - 1:
                sub["end_page"] = chapter["subchapters"][j + 1]["start_page"]
            else:
                sub["end_page"] = chapter["end_page"]

    # Step 3: Extract content
    chapters_output = []
    for chap_id, chapter in enumerate(structure):
        chapter_text = ""
        for page_num in range(chapter["start_page"] - 1, chapter["end_page"] - 1):
            chapter_text += doc[page_num].get_text()

        subchapters_output = []
        for sub_id, sub in enumerate(chapter["subchapters"]):
            sub_text = ""
            for page_num in range(sub["start_page"] - 1, sub["end_page"] - 1):
                sub_text += doc[page_num].get_text()

            subchapters_output.append({
                "id": f"{chap_id}.{sub_id}",
                "title": sub["title"],
                "content": sub_text.strip()
            })

        chapters_output.append({
            "id": str(chap_id),
            "title": chapter["title"],
            "content": chapter_text.strip(),
            "subchapters": subchapters_output
        })

    return { "chapters": chapters_output }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({ "error": "Usage: python parser.py <pdf_path>" }))
        sys.exit(1)

    pdf_path = sys.argv[1]
    try:
        result = extract_hierarchy(pdf_path)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({ "error": str(e) }))
        sys.exit(1)

if __name__ == "__main__":
    main()
