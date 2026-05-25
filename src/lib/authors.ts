export type AuthorInfo = {
  name: string;
  role: string;
  roleHr: string;
  bio: string;
  bioHr: string;
};

export const authors: Record<string, AuthorInfo> = {
  "Iva Leder": {
    name: "Iva Leder",
    role: "Educator & Child Development Writer",
    roleHr: "Pedagoginja i autorica",
    bio: "Iva is a mother and educator with a passion for child psychology and early development. She writes practical guides to help parents and educators support children's growth through play, science and creativity.",
    bioHr: "Iva je majka i pedagoginja s velikim interesom za dječju psihologiju i rani razvoj djeteta. Piše praktične vodiče koji roditeljima i odgajateljima pomažu podupirati djetetov razvoj kroz igru, znanost i kreativnost.",
  },
  "Vedran Leder": {
    name: "Vedran Leder",
    role: "Engineer & STEM Education Writer",
    roleHr: "Inženjer i STEM autor",
    bio: "Vedran is an engineer and father who loves turning everyday materials into hands-on STEM experiments. He designs the activities and engineering challenges that make science accessible and exciting for young explorers.",
    bioHr: "Vedran je inženjer i tata koji voli pretvarati svakodnevne materijale u praktične STEM pokuse. Osmišljava aktivnosti i inženjerske izazove koji djeci čine znanost pristupačnom i uzbudljivom.",
  },
};
