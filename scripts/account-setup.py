import time
from selenium import webdriver
from selenium.webdriver.common.by import By

# Initialiser le navigateur
def init_browser():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    return driver

# Se connecter à YouTube (il faut être connecté manuellement pour la première fois)
def login_to_youtube(driver):
    driver.get("https://www.youtube.com")
    time.sleep(10)  # Attendre que l'utilisateur se connecte manuellement si nécessaire

# Ouvrir et regarder les vidéos
def watch_videos(driver, urls):
    for index, url in enumerate(urls):
        driver.get(url)
        time.sleep(10)  # Attendre que la vidéo soit lue pendant quelques secondes
        print(f"Video {index + 1}/{len(urls)}: {url} has been watched.")
        # Actualisation pour s'assurer que la vidéo est ajoutée à l'historique
        driver.refresh()
        time.sleep(2)

# Liste des URLs de vidéos
urls = [
    'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
'https://www.youtube.com/watch?v=a79iLjV-HKw',
'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
'https://www.youtube.com/watch?v=DyDfgMOUjCI',
'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
'https://www.youtube.com/watch?v=ktvTqknDobU',
'https://www.youtube.com/watch?v=bpOSxM0rNPM',
'https://www.youtube.com/watch?v=eBG7P-K-r1Y',
'https://www.youtube.com/watch?v=GGhKPm18E48',
'https://www.youtube.com/watch?v=xpVfcZ0ZcFM',
'https://www.youtube.com/watch?v=Stet_4bnclk',
'https://www.youtube.com/watch?v=ov4WobPqoSA',
'https://www.youtube.com/watch?v=JRfuAukYTKg',
'https://www.youtube.com/watch?v=CCHdMIEGaaM',
'https://www.youtube.com/watch?v=gCYcHz2k5x0',
'https://www.youtube.com/watch?v=ebXbLfLACGM',
'https://www.youtube.com/watch?v=VHoT4N43jK8',
'https://www.youtube.com/watch?v=85m-Qgo9_nE',
'https://www.youtube.com/watch?v=PpRgiaONETI',
'https://www.youtube.com/watch?v=eLYyCFuPCX8',
'https://www.youtube.com/watch?v=ZiKINKaDG8U',
'https://www.youtube.com/watch?v=ET_RXwZwrBg',
'https://www.youtube.com/watch?v=d0mSp-Y-LZw',
'https://www.youtube.com/watch?v=4tcooPzKFxo',
'https://www.youtube.com/watch?v=e8Tuqf-i0LA',
'https://www.youtube.com/watch?v=QuGcoOJKXT8',
'https://www.youtube.com/watch?v=18ZPOsV2s3U',
'https://www.youtube.com/watch?v=0c17_4Ud9xk',
'https://www.youtube.com/watch?v=70slr7skdtI',
'https://www.youtube.com/watch?v=uPiI3tT_ooc',
'https://www.youtube.com/watch?v=qkCGPSzuddY',
'https://www.youtube.com/watch?v=iNYNtTB7EJ4',
'https://www.youtube.com/watch?v=-KKv5gxvMHE',
'https://www.youtube.com/watch?v=ny4-bl0WevU',
'https://www.youtube.com/watch?v=qZah7fKtGGw',
'https://www.youtube.com/watch?v=EXrseCoEJGA',
'https://www.youtube.com/watch?v=OmaErKFDWPE',
'https://www.youtube.com/watch?v=THD53Sn9sPs',
'https://www.youtube.com/watch?v=SPyC0JLvl1c',
'https://www.youtube.com/watch?v=hZrCc5VlEtA',
'https://www.youtube.com/watch?v=Z7M_w5sV81w',
'https://www.youtube.com/watch?v=5YWjm99iauc',
'https://www.youtube.com/watch?v=zKCOoFlJE5o',
'https://www.youtube.com/watch?v=kyq31-aJPtc',
'https://www.youtube.com/watch?v=lxPp5OLtyVA',
'https://www.youtube.com/watch?v=NXT35m1y0-8',
'https://www.youtube.com/watch?v=w0X7TVcCpwg',
'https://www.youtube.com/watch?v=zXyHUwhzpGk',
'https://www.youtube.com/watch?v=ymhwrxvpdnQ',
'https://www.youtube.com/watch?v=DUuHWtBOE48',
'https://www.youtube.com/watch?v=QNt_2T9xkYk',
'https://www.youtube.com/watch?v=KjTno8HBWyA',
'https://www.youtube.com/watch?v=MNCr86lwAQo',
'https://www.youtube.com/watch?v=HwR2s0XxV5Y',
'https://www.youtube.com/watch?v=L_SjWfdOafI',
'https://www.youtube.com/watch?v=_Igrackgh6M',
'https://www.youtube.com/watch?v=au1XAC-olo0',
'https://www.youtube.com/watch?v=HU4MATCn1XA',
'https://www.youtube.com/watch?v=psaDHhZ0cPs',
'https://www.youtube.com/watch?v=kNj96EjevxU',
'https://www.youtube.com/watch?v=X7d9IdBHUDk',
'https://www.youtube.com/watch?v=w7nh0EqzCsM',
'https://www.youtube.com/watch?v=6gq2b2rmFEA',
'https://www.youtube.com/watch?v=MWb3zH2NNaQ',
'https://www.youtube.com/watch?v=J8XTq_gv6Pg',
'https://www.youtube.com/watch?v=YpTZoUuLBK8',
'https://www.youtube.com/watch?v=ejK3y228bbw',
'https://www.youtube.com/watch?v=oNsVUW7m1gE',
'https://www.youtube.com/watch?v=HkfB3V8kUoE',
'https://www.youtube.com/watch?v=D7xzihdA65I',
'https://www.youtube.com/watch?v=pQw6Y1bOWiU',
'https://www.youtube.com/watch?v=tdK9wd9TrRM',
'https://www.youtube.com/watch?v=9haHg3Aw45E',
'https://www.youtube.com/watch?v=QWmIQ5_yaFU',
'https://www.youtube.com/watch?v=2hkXzxstIf4',
'https://www.youtube.com/watch?v=B3uJ0qPlxAE',
'https://www.youtube.com/watch?v=vudeAOXVX20',
'https://www.youtube.com/watch?v=QvAq2i7mrnU',
'https://www.youtube.com/watch?v=vLTjsfxuKXA',
'https://www.youtube.com/watch?v=4BdTB9R1Rb0',
'https://www.youtube.com/watch?v=CR_ISOmshh4',
'https://www.youtube.com/watch?v=8ckim7xYhkY',
'https://www.youtube.com/watch?v=H1mEmoYxjDM',
'https://www.youtube.com/watch?v=GgKIhlyjX2w',
'https://www.youtube.com/watch?v=C2lqWZ6SemI',
'https://www.youtube.com/watch?v=45l6bl8Uyr4',
'https://www.youtube.com/watch?v=sFvj6a_GlPY',
'https://www.youtube.com/watch?v=xeO1dPWrI28',
'https://www.youtube.com/watch?v=4igqUdoA2H8',
'https://www.youtube.com/watch?v=3jvR-c8GWtw',
'https://www.youtube.com/watch?v=CVv9H1N2_B8',
'https://www.youtube.com/watch?v=wNKLyxyOpXs',
'https://www.youtube.com/watch?v=i_mYk1KiJfI',
'https://www.youtube.com/watch?v=oczhw6ikmSE',
'https://www.youtube.com/watch?v=K2SCc87-68A',
'https://www.youtube.com/watch?v=5ZeilD1blQM',
'https://www.youtube.com/watch?v=bjYNN7KFIio',
'https://www.youtube.com/watch?v=_oBV-SiOl7c',
'https://www.youtube.com/watch?v=xGPsBC96nC4',
'https://www.youtube.com/watch?v=uxm1WBF04PA'
]

# Script principal
if __name__ == "__main__":
    driver = init_browser()
    login_to_youtube(driver)
    watch_videos(driver, urls)
    driver.quit()
