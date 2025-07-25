//
//  GuidePageVC.swift
//  ANUBIS
//
//  Created by TecSpine on 9/16/21.
//

import UIKit

class GuidePageVC: UIViewController {
    // MARK: - IBOutlets
      @IBOutlet weak var imageView: UIImageView!
      @IBOutlet weak var titleLabel: UILabel!
      
    @IBOutlet weak var scrollView: UIScrollView!
    // MARK: - Class Properties
      var model: GuidePageModel!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupGUI()
        scrollView.layoutIfNeeded()
        scrollView.isScrollEnabled = true
        scrollView.contentSize = CGSize(width: self.view.frame.width, height: scrollView.frame.size.height)
      
    }
    
    func setupGUI() {
        imageView.layer.cornerRadius = 14
        imageView.layer.borderColor = #colorLiteral(red: 0.5568627715, green: 0.3529411852, blue: 0.9686274529, alpha: 1)
        imageView.layer.borderWidth = 6
        imageView.image = UIImage(named: model.imageName)
        titleLabel.text = model.text
      }

}
