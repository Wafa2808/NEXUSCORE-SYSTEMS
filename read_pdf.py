import PyPDF2

def extract_text(pdf_path, out_path):
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
    with open(out_path, 'w', encoding='utf-8') as out:
        out.write(text)

extract_text("Proyecto IV. Programacion Matematica.PDF", "output.txt")
