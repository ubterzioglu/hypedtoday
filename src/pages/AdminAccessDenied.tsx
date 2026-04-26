import { Link } from "react-router-dom";
import { Linkedin, ShieldX } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrutalButton } from "@/components/ui/brutal-button";

const AdminAccessDenied = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <section className="w-full max-w-2xl text-center">
                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center border-4 border-foreground bg-destructive text-destructive-foreground shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                        <ShieldX className="h-12 w-12" aria-hidden="true" />
                    </div>

                    <h1 className="mb-4 text-4xl font-black uppercase md:text-5xl">
                        Admin yetkiniz yok
                    </h1>

                    <p className="mx-auto mb-8 max-w-xl text-lg font-bold text-muted-foreground">
                        Bu alan sadece admin kullanıcılar içindir. Normal kullanıcı olarak LinkedIn sayfasından devam edebilirsiniz.
                    </p>

                    <Link to="/linkedin">
                        <BrutalButton variant="primary" size="lg" className="text-lg">
                            <Linkedin className="mr-2 h-5 w-5" aria-hidden="true" />
                            LinkedIn sayfasına git
                        </BrutalButton>
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AdminAccessDenied;
